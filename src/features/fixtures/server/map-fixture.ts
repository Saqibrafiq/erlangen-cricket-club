import { getTeamOutcome, resolveMatchResult, type ResultInput } from '@/domain/cricket'
import type { Competition, Fixture, Team } from '@/payload-types'

import type { FixtureInnings, FixtureSummary, FixtureTeam } from '../types'

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

function relationId(value: number | { id: number } | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  return typeof value === 'number' ? value : value.id
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

function toResultInput(doc: Fixture, innings: FixtureInnings[]): ResultInput<number> {
  const method = doc.result?.method ?? 'normal'
  const winnerTeamId = relationId(doc.result?.winner)

  switch (method) {
    case 'normal':
      return { method, innings }
    case 'dls': {
      const { marginValue, marginUnit } = doc.result ?? {}
      const margin =
        typeof marginValue === 'number' && marginUnit
          ? { value: marginValue, unit: marginUnit }
          : null
      return { method, winnerTeamId, margin }
    }
    case 'forfeit':
    case 'walkover':
      if (winnerTeamId === null) {
        throw new FixtureMappingError(`Fixture ${doc.id}: ${method} without winner`)
      }
      return { method, winnerTeamId }
    case 'no-result':
      return { method }
  }
}

/** Maps a Payload fixture (queried with depth >= 1) to the view model used by the UI. */
export function mapFixture(doc: Fixture): FixtureSummary {
  const competition = requirePopulated<Competition>(doc.competition, 'competition', doc.id)
  const teams = [
    mapTeam(requirePopulated<Team>(doc.team1, 'team1', doc.id)),
    mapTeam(requirePopulated<Team>(doc.team2, 'team2', doc.id)),
  ] as const
  const innings = mapInnings(doc)
  const result = doc.status === 'completed' ? resolveMatchResult(toResultInput(doc, innings)) : null
  const clubTeam = teams.find((team) => team.isClubTeam)

  return {
    id: doc.id,
    date: doc.date,
    startTime: doc.startTime ?? null,
    venue: doc.venue ?? null,
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
