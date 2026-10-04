import type { Payload } from 'payload'

import { slugify } from '../../shared/lib/slugify'
import type { RevalidateContext } from '../hooks/revalidate-pages'
import { SEED_COMPETITIONS, SEED_TEAMS } from './data'
import type { SeedCompetition, SeedFixture, SeedResult, SeedStandingsRow } from './types'

const SEED_CONTEXT: RevalidateContext = { disableRevalidate: true }
// Payload stores day-only dates at noon UTC so they never shift across time zones.
const DAY_ONLY_TIME = 'T12:00:00.000Z'

type TeamIds = Map<string, number>

function requireTeamId(teamIds: TeamIds, shortName: string): number {
  const id = teamIds.get(shortName)

  if (id === undefined) {
    throw new Error(`Seed references unknown team "${shortName}"`)
  }

  return id
}

async function upsertTeams(payload: Payload): Promise<TeamIds> {
  const teamIds: TeamIds = new Map()

  for (const team of SEED_TEAMS) {
    const existing = await payload.find({
      collection: 'teams',
      where: { shortName: { equals: team.shortName } },
      limit: 1,
      depth: 0,
    })
    const doc =
      existing.docs[0] ??
      (await payload.create({ collection: 'teams', data: team, context: SEED_CONTEXT }))

    teamIds.set(team.shortName, doc.id)
  }

  return teamIds
}

async function upsertCompetition(payload: Payload, competition: SeedCompetition): Promise<number> {
  const slug = slugify(`${competition.name} ${competition.season}`)
  const existing = await payload.find({
    collection: 'competitions',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: 'competitions',
      data: { ...competition, slug },
      context: SEED_CONTEXT,
    }))

  return doc.id
}

/** Fills in a published table only while the competition has none, so editor changes win. */
async function seedStandingsIfEmpty(
  payload: Payload,
  competitionId: number,
  standings: SeedStandingsRow[],
  teamIds: TeamIds,
): Promise<boolean> {
  const competition = await payload.findByID({
    collection: 'competitions',
    id: competitionId,
    depth: 0,
  })

  if (standings.length === 0 || (competition.standings ?? []).length > 0) {
    return false
  }

  await payload.update({
    collection: 'competitions',
    id: competitionId,
    context: SEED_CONTEXT,
    data: {
      standings: standings.map(({ team, ...row }) => ({
        ...row,
        team: requireTeamId(teamIds, team),
      })),
    },
  })

  return true
}

function toResultData(result: SeedResult, teamIds: TeamIds) {
  if (result.method === 'forfeit' || result.method === 'walkover') {
    return { method: result.method, winner: requireTeamId(teamIds, result.winner) }
  }

  if (result.method === 'dls') {
    return {
      method: result.method,
      winner: result.winner === null ? null : requireTeamId(teamIds, result.winner),
      marginValue: result.margin?.value ?? null,
      marginUnit: result.margin?.unit ?? null,
    }
  }

  return { method: result.method }
}

function getListedTeams(fixture: SeedFixture): [string, string] {
  if (fixture.teams) {
    return fixture.teams
  }

  const [first, second] = fixture.innings

  if (!first || !second) {
    throw new Error(
      `Seed fixture ${fixture.importKey} needs "teams" when fewer than 2 innings exist`,
    )
  }

  return [first.team, second.team]
}

async function createFixtureIfMissing(
  payload: Payload,
  fixture: SeedFixture,
  competitionId: number,
  teamIds: TeamIds,
): Promise<boolean> {
  const existing = await payload.count({
    collection: 'fixtures',
    where: { importKey: { equals: fixture.importKey } },
  })

  if (existing.totalDocs > 0) {
    return false
  }

  const [team1, team2] = getListedTeams(fixture)

  await payload.create({
    collection: 'fixtures',
    context: SEED_CONTEXT,
    data: {
      importKey: fixture.importKey,
      competition: competitionId,
      stage: fixture.stage,
      date: `${fixture.date}${DAY_ONLY_TIME}`,
      team1: requireTeamId(teamIds, team1),
      team2: requireTeamId(teamIds, team2),
      status: 'completed',
      innings: fixture.innings.map(({ team, ...score }) => ({
        ...score,
        battingTeam: requireTeamId(teamIds, team),
      })),
      result: toResultData(fixture.result, teamIds),
    },
  })

  return true
}

/**
 * Imports the 2026 results and published standings of all seeded competitions. Idempotent: existing teams,
 * competitions and fixtures (matched by short name, slug and import key) are left
 * untouched, so editor changes in the admin are never overwritten.
 */
export async function seed(payload: Payload): Promise<void> {
  const teamIds = await upsertTeams(payload)

  for (const { competition, fixtures, standings = [] } of SEED_COMPETITIONS) {
    const competitionId = await upsertCompetition(payload, competition)

    if (await seedStandingsIfEmpty(payload, competitionId, standings, teamIds)) {
      payload.logger.info(`${competition.name} ${competition.season}: standings created.`)
    }

    let created = 0
    for (const fixture of fixtures) {
      if (await createFixtureIfMissing(payload, fixture, competitionId, teamIds)) {
        created += 1
      }
    }

    payload.logger.info(
      `${competition.name} ${competition.season}: ${created} fixtures created, ${fixtures.length - created} already present.`,
    )
  }
}
