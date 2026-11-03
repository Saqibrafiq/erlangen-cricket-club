'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Payload, type TypedUser } from 'payload'

import {
  parseCompetitionImportForm,
  resolveCompetition,
  resolveTeams,
} from '@/features/competitions'
import type { Fixture } from '@/payload-types'

import { type ImportedFixture, parseFixturesCsv } from '../domain/fixtures-csv'
import { diffFixtures, type ExistingImportedFixture } from '../domain/fixtures-diff'
import type { FixtureEditorResult, FixtureImportData, ImportFixturesResult } from '../editor-types'

/*
 * Import actions for signed-in editors. Server actions are public endpoints, so each one checks
 * the session itself and writes as that user with Payload's access control on
 * (`overrideAccess: false`). The CSV is parsed and compared again here: the preview is a courtesy.
 *
 * Imported fixtures carry `importKey` "csv-{competition}-{key}". Only those are ever updated or
 * removed by a later import, and only while they are still to be played.
 */

type Editor = { payload: Payload; user: TypedUser }

const CSV_KEY_PREFIX = 'csv'
/** Day-only fixtures are stored at noon UTC, so the day is the same in every time zone. */
const NOON_UTC = 'T12:00:00.000Z'

async function getEditor(): Promise<Editor | null> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user ? { payload, user } : null
}

function keyPrefix(competitionId: number): string {
  return `${CSV_KEY_PREFIX}-${String(competitionId)}-`
}

function shortNameOf(team: Fixture['team1']): string {
  return typeof team === 'object' ? team.shortName : ''
}

function toExisting(doc: Fixture, prefix: string): ExistingImportedFixture {
  return {
    id: doc.id,
    key: (doc.importKey ?? '').slice(prefix.length),
    day: doc.date.slice(0, 10),
    startTime: doc.startTime ?? null,
    homeShortName: shortNameOf(doc.team1),
    awayShortName: shortNameOf(doc.team2),
    groundName: typeof doc.ground === 'object' ? (doc.ground?.name ?? null) : null,
    stage: doc.stage,
    status: doc.status,
  }
}

async function findImportedFixtures(
  { payload, user }: Editor,
  competitionId: number,
): Promise<ExistingImportedFixture[]> {
  const prefix = keyPrefix(competitionId)
  const { docs } = await payload.find({
    collection: 'fixtures',
    where: {
      and: [{ competition: { equals: competitionId } }, { importKey: { like: prefix } }],
    },
    depth: 1,
    pagination: false,
    user,
    overrideAccess: false,
  })
  // `like` matches anywhere; keep the ones that really start with the prefix.
  return docs
    .filter((doc) => doc.importKey?.startsWith(prefix))
    .map((doc) => toExisting(doc, prefix))
}

/** Competitions (newest season first) with their imported fixtures, and our teams and grounds. */
export async function getFixtureImportDataAction(): Promise<
  FixtureEditorResult<FixtureImportData>
> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const { payload, user } = editor

  try {
    const [competitions, teams, grounds] = await Promise.all([
      payload.find({
        collection: 'competitions',
        sort: ['-season', 'name'],
        depth: 0,
        pagination: false,
        select: { name: true, season: true },
        user,
        overrideAccess: false,
      }),
      payload.find({
        collection: 'teams',
        depth: 0,
        pagination: false,
        select: { shortName: true },
        user,
        overrideAccess: false,
      }),
      payload.find({
        collection: 'grounds',
        depth: 0,
        pagination: false,
        select: { name: true },
        user,
        overrideAccess: false,
      }),
    ])
    return {
      status: 'ok',
      data: {
        competitions: await Promise.all(
          competitions.docs.map(async (competition) => ({
            id: competition.id,
            name: competition.name,
            season: competition.season,
            fixtures: await findImportedFixtures(editor, competition.id),
          })),
        ),
        teams: teams.docs.map((team) => team.shortName),
        grounds: grounds.docs.map((ground) => ground.name),
      },
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not load the fixtures import')
    return { status: 'error' }
  }
}

/**
 * Ground ids by name, adding grounds we don't have yet. An address in the file fills in a saved
 * ground that has none; an address someone already saved is never overwritten.
 */
async function resolveGrounds(
  { payload, user }: Editor,
  fixtures: readonly ImportedFixture[],
): Promise<{ ids: Map<string, number>; added: number }> {
  const addresses = new Map<string, string | null>()
  for (const { ground } of fixtures) {
    if (ground && !addresses.get(ground.name)) addresses.set(ground.name, ground.address)
  }
  const { docs } = await payload.find({
    collection: 'grounds',
    where: { name: { in: [...addresses.keys()] } },
    depth: 0,
    pagination: false,
    user,
    overrideAccess: false,
  })
  const ids = new Map(docs.map((ground) => [ground.name, ground.id]))
  for (const ground of docs) {
    const address = addresses.get(ground.name)
    if (address && !ground.address) {
      await payload.update({
        collection: 'grounds',
        id: ground.id,
        data: { address },
        user,
        overrideAccess: false,
      })
    }
  }
  let added = 0
  for (const [name, address] of addresses) {
    if (ids.has(name)) continue
    const ground = await payload.create({
      collection: 'grounds',
      data: { name, address },
      user,
      overrideAccess: false,
    })
    ids.set(name, ground.id)
    added++
  }
  return { ids, added }
}

/**
 * Adds a season's schedule to a competition: new fixtures are created, rescheduled ones updated,
 * upcoming ones the file no longer lists removed. Played fixtures and results are never touched.
 */
export async function importFixturesAction(formData: FormData): Promise<ImportFixturesResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const form = parseCompetitionImportForm(formData)
  if (!form.success) {
    return { status: 'invalid', fieldErrors: form.fieldErrors }
  }
  const schedule = parseFixturesCsv(form.csv)
  if (!schedule.success) {
    return { status: 'invalidFile', errors: schedule.errors }
  }

  const { payload, user } = editor
  try {
    const competitionId = await resolveCompetition(editor, form.target)
    const [teams, grounds, existing] = await Promise.all([
      resolveTeams(
        editor,
        schedule.fixtures.flatMap((fixture) => [fixture.homeShortName, fixture.awayShortName]),
      ),
      resolveGrounds(editor, schedule.fixtures),
      findImportedFixtures(editor, competitionId),
    ])
    const diff = diffFixtures(existing, schedule.fixtures, {
      teams: new Set(teams.ids.keys()),
      grounds: new Set(grounds.ids.keys()),
    })
    const existingIds = new Map(existing.map((fixture) => [fixture.key, fixture.id]))
    const dataFor = (fixture: ImportedFixture) => {
      const team1 = teams.ids.get(fixture.homeShortName)
      const team2 = teams.ids.get(fixture.awayShortName)
      // resolveTeams found or added every team; a gap is a bug, not bad input.
      if (team1 === undefined || team2 === undefined) throw new Error('Unresolved team')
      return {
        competition: competitionId,
        date: `${fixture.day}${NOON_UTC}`,
        startTime: fixture.startTime,
        ground: fixture.ground ? (grounds.ids.get(fixture.ground.name) ?? null) : null,
        stage: fixture.stage,
        team1,
        team2,
      }
    }

    let created = 0
    let updated = 0
    for (const change of diff.changes) {
      if (change.kind === 'new') {
        await payload.create({
          collection: 'fixtures',
          data: {
            ...dataFor(change.fixture),
            status: 'scheduled',
            importKey: `${keyPrefix(competitionId)}${change.fixture.key}`,
          },
          user,
          overrideAccess: false,
        })
        created++
      }
      const id = existingIds.get(change.fixture.key)
      if (change.kind === 'changed' && id !== undefined) {
        await payload.update({
          collection: 'fixtures',
          id,
          data: dataFor(change.fixture),
          user,
          overrideAccess: false,
        })
        updated++
      }
    }
    for (const fixture of diff.removed) {
      await payload.delete({ collection: 'fixtures', id: fixture.id, user, overrideAccess: false })
    }

    const competition = await payload.findByID({
      collection: 'competitions',
      id: competitionId,
      depth: 0,
      user,
      overrideAccess: false,
    })
    return {
      status: 'imported',
      competition: { name: competition.name, season: competition.season },
      created,
      updated,
      removed: diff.removed.length,
      teamsAdded: teams.added,
      groundsAdded: grounds.added,
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not import fixtures')
    return { status: 'error' }
  }
}
