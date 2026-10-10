import { getTeamOutcome, resolveMatchResult } from '@/domain/cricket'

import type { FixtureInnings, FixtureSummary, FixtureTeam } from './types'

/** Test and Storybook data builders — not part of the production bundle. */
export const ECC_TEAM: FixtureTeam = {
  id: 1,
  name: 'Erlangen Cricket Club I',
  shortName: 'ECC-I',
  isClubTeam: true,
}

export const NCC_TEAM: FixtureTeam = { id: 2, name: 'NCC-I', shortName: 'NCC-I', isClubTeam: false }

export function makeInnings(
  team: FixtureTeam,
  runs: number,
  wickets: number,
  overs = '20',
  maxOvers = 20,
): FixtureInnings {
  return { battingTeamId: team.id, runs, wickets, overs, maxOvers }
}

/** A completed fixture decided on the field, with result derived from the innings. */
export function makeCompletedFixture(overrides: Partial<FixtureSummary> = {}): FixtureSummary {
  const teams = overrides.teams ?? ([NCC_TEAM, ECC_TEAM] as const)
  const innings = overrides.innings ?? [
    makeInnings(teams[0], 236, 5),
    makeInnings(teams[1], 204, 10, '19.2'),
  ]
  const result =
    overrides.result !== undefined
      ? overrides.result
      : resolveMatchResult({ method: 'normal', innings: [...innings] })
  const clubTeam = teams.find((team) => team.isClubTeam)

  return {
    id: 1,
    date: '2026-09-06T12:00:00.000Z',
    startTime: null,
    venue: null,
    stage: 'final',
    status: 'completed',
    competition: {
      id: 1,
      slug: 'bcv-t20-regionalliga-bayern-2026',
      name: 'BCV T20 Regionalliga Bayern',
      season: '2026',
      isFeatured: false,
    },
    clubOutcome: result && clubTeam ? getTeamOutcome(result, clubTeam.id) : null,
    ...overrides,
    teams,
    innings,
    result,
  }
}

export function makeScheduledFixture(overrides: Partial<FixtureSummary> = {}): FixtureSummary {
  return {
    id: 100,
    date: '2027-05-15T12:00:00.000Z',
    startTime: '11:00',
    venue: 'Erlangen Cricket Ground',
    stage: 'league',
    status: 'scheduled',
    competition: {
      id: 5,
      slug: 'bcv-t20-regionalliga-bayern-2027',
      name: 'BCV T20 Regionalliga Bayern',
      season: '2027',
      isFeatured: true,
    },
    teams: [ECC_TEAM, NCC_TEAM],
    innings: [],
    result: null,
    clubOutcome: null,
    ...overrides,
  }
}
