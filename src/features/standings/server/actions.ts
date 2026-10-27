'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Payload, type TypedUser } from 'payload'

import type { Competition } from '@/payload-types'

import { type ImportedStandingsRow, parseStandingsCsv } from '../domain/standings-csv'
import {
  parseStandingsImportForm,
  type StandingsImportTarget,
} from '../domain/standings-import-form'
import type {
  ImportStandingsResult,
  StandingsEditorResult,
  StandingsImportData,
} from '../editor-types'

/*
 * Import actions for signed-in editors. Server actions are public endpoints, so each one checks
 * the session itself and writes as that user with Payload's access control on
 * (`overrideAccess: false`). The CSV is parsed again here: the browser's preview is a courtesy.
 */

type Editor = { payload: Payload; user: TypedUser }
type StoredRow = NonNullable<Competition['standings']>[number]

async function getEditor(): Promise<Editor | null> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user ? { payload, user } : null
}

function toImportedRow(row: StoredRow): ImportedStandingsRow | null {
  if (typeof row.team !== 'object') {
    return null
  }
  return {
    teamShortName: row.team.shortName,
    played: row.played,
    won: row.won,
    lost: row.lost,
    noResult: row.noResult,
    tied: row.tied,
    points: row.points,
    winRate: row.winRate,
    netRunRate: row.netRunRate,
    runsFor: row.runsFor,
    oversFaced: row.oversFaced,
    runsAgainst: row.runsAgainst,
    oversBowled: row.oversBowled,
  }
}

/** Competitions (newest season first) with their current tables, and the teams we know. */
export async function getStandingsImportDataAction(): Promise<
  StandingsEditorResult<StandingsImportData>
> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const { payload, user } = editor

  try {
    const [competitions, teams] = await Promise.all([
      payload.find({
        collection: 'competitions',
        sort: ['-season', 'name'],
        depth: 1,
        pagination: false,
        user,
        overrideAccess: false,
      }),
      payload.find({
        collection: 'teams',
        depth: 0,
        pagination: false,
        select: { name: true, shortName: true, isClubTeam: true },
        user,
        overrideAccess: false,
      }),
    ])
    return {
      status: 'ok',
      data: {
        competitions: competitions.docs.map((competition) => ({
          id: competition.id,
          name: competition.name,
          season: competition.season,
          rows: (competition.standings ?? []).map(toImportedRow).filter((row) => row !== null),
        })),
        teams: teams.docs.map((team) => ({
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          isClubTeam: team.isClubTeam ?? false,
        })),
      },
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not load the standings import')
    return { status: 'error' }
  }
}

/** Team ids by short name, adding the teams we don't have yet (opponents new to the league). */
async function resolveTeams(
  { payload, user }: Editor,
  shortNames: readonly string[],
): Promise<{ ids: Map<string, number>; added: number }> {
  const { docs } = await payload.find({
    collection: 'teams',
    where: { shortName: { in: shortNames } },
    depth: 0,
    pagination: false,
    select: { shortName: true },
    user,
    overrideAccess: false,
  })
  const ids = new Map(docs.map((team) => [team.shortName, team.id]))
  let added = 0
  for (const shortName of shortNames) {
    if (ids.has(shortName)) continue
    // CricClubs only gives the code; editors can add the full name in the admin later.
    const team = await payload.create({
      collection: 'teams',
      data: { name: shortName, shortName },
      user,
      overrideAccess: false,
    })
    ids.set(shortName, team.id)
    added++
  }
  return { ids, added }
}

async function resolveCompetition(
  { payload, user }: Editor,
  target: StandingsImportTarget,
): Promise<number> {
  if (target.kind === 'existing') {
    return target.id
  }
  const competition = await payload.create({
    collection: 'competitions',
    data: { ...target.competition, slug: '' },
    user,
    overrideAccess: false,
  })
  return competition.id
}

/** Replaces a competition's table with a CricClubs points table export. */
export async function importStandingsAction(formData: FormData): Promise<ImportStandingsResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }

  const form = parseStandingsImportForm(formData)
  if (!form.success) {
    return { status: 'invalid', fieldErrors: form.fieldErrors }
  }
  const table = parseStandingsCsv(form.csv)
  if (!table.success) {
    return { status: 'invalidFile', errors: table.errors }
  }

  const { payload, user } = editor
  try {
    const teams = await resolveTeams(
      editor,
      table.rows.map((row) => row.teamShortName),
    )
    const competitionId = await resolveCompetition(editor, form.target)
    const competition = await payload.update({
      collection: 'competitions',
      id: competitionId,
      data: {
        standings: table.rows.map(({ teamShortName, ...row }) => {
          const team = teams.ids.get(teamShortName)
          // resolveTeams found or added every team; a gap is a bug, not bad input.
          if (team === undefined) throw new Error(`No team for "${teamShortName}"`)
          return { ...row, team }
        }),
      },
      user,
      overrideAccess: false,
    })
    return {
      status: 'imported',
      competition: {
        name: competition.name,
        season: competition.season,
        slug: competition.slug,
      },
      teamCount: table.rows.length,
      teamsAdded: teams.added,
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not import standings')
    return { status: 'error' }
  }
}
