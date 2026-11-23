import { getFixtureResult, relationId } from '@/cms/fields/fixture-result'
import { getTeamOutcome } from '@/domain/cricket'
import type { Competition, Fixture, Ground, Team } from '@/payload-types'

import type { FixtureGround, FixtureInnings, FixtureSummary, FixtureTeam } from '../types'

/** Thrown when a fixture was queried without populated relations (programming error). */
export class FixtureMappingError extends Error {
  override name = 'FixtureMappingError'
}

function requirePopulated<T extends object>(
  value: number | T | null | undefined,
  field: string,
  fixtureId: number,
): T {
  if (typeof value !== 'object' || value === null) {
    throw new FixtureMappingError(
      `Fixture ${fixtureId}: "${field}" must be populated (query with depth >= 1)`,
    )
  }

  return value
}

function mapTeam(team: Team): FixtureTeam {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    isClubTeam: team.isClubTeam ?? false,
  }
}

function mapInnings(doc: Fixture): FixtureInnings[] {
  return (doc.innings ?? []).map((innings) => {
    const battingTeamId = relationId(innings.battingTeam)

    if (battingTeamId === null) {
      throw new FixtureMappingError(`Fixture ${doc.id}: innings without batting team`)
    }

    return {
      battingTeamId,
      runs: innings.runs,
      wickets: innings.wickets,
      overs: innings.overs,
      maxOvers: innings.maxOvers,
    }
  })
}

/** The ground, when one is set and populated (queried with depth >= 1). */
function mapGround(ground: number | Ground | null | undefined): FixtureGround | null {
  return typeof ground === 'object' && ground !== null
    ? { name: ground.name, address: ground.address ?? null, clubCode: ground.clubCode ?? null }
    : null
}

/** Maps a Payload fixture (queried with depth >= 1) to the view model used by the UI. */
export function mapFixture(doc: Fixture): FixtureSummary {
  const competition = requirePopulated<Competition>(doc.competition, 'competition', doc.id)
  const teams = [
    mapTeam(requirePopulated<Team>(doc.team1, 'team1', doc.id)),
    mapTeam(requirePopulated<Team>(doc.team2, 'team2', doc.id)),
  ] as const
  const innings = mapInnings(doc)
  const result = getFixtureResult(doc)
  const clubTeam = teams.find((team) => team.isClubTeam)

  return {
    id: doc.id,
    date: doc.date,
    startTime: doc.startTime ?? null,
    ground: mapGround(doc.ground),
    stage: doc.stage,
    status: doc.status,
    competition: {
      id: competition.id,
      slug: competition.slug,
      name: competition.name,
      season: competition.season,
      isFeatured: competition.isFeatured ?? false,
    },
    teams,
    innings,
    result,
    clubOutcome: result && clubTeam ? getTeamOutcome(result, clubTeam.id) : null,
  }
}
