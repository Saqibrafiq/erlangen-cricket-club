import { describe, expect, it } from 'vitest'

import { ECC_TEAM, makeCompletedFixture, makeScheduledFixture, NCC_TEAM } from '../test-factories'
import type { FixtureTeam } from '../types'
import { buildCompetitionNavigation, summariseCompetitions } from './summarise-competitions'

const ECC_II: FixtureTeam = {
  id: 3,
  name: 'Erlangen Cricket Club II',
  shortName: 'ECC-II',
  isClubTeam: true,
}
const T20 = {
  id: 1,
  slug: 'bcv-t20-2026',
  name: 'BCV T20 Regionalliga Bayern',
  season: '2026',
  isFeatured: false,
}
const BUNDESLIGA = {
  id: 2,
  slug: 'dcb-bl-2026',
  name: 'DCB-Bundesliga Südost: Bayern',
  season: '2026',
  isFeatured: false,
}
const REGIONALLIGA = {
  id: 3,
  slug: 'bcv-rl-2026',
  name: 'BCV Regionalliga Bayern',
  season: '2026',
  isFeatured: false,
}
const OLD_T20 = {
  id: 4,
  slug: 'bcv-t20-2025',
  name: 'BCV T20 Regionalliga Bayern',
  season: '2025',
  isFeatured: false,
}

describe('summariseCompetitions', () => {
  it('derives club teams and record per competition', () => {
    const [summary] = summariseCompetitions([
      makeCompletedFixture({ id: 1, competition: T20, clubOutcome: 'won' }),
      makeCompletedFixture({ id: 2, competition: T20, clubOutcome: 'lost' }),
      makeScheduledFixture({ id: 3, competition: T20 }),
    ])

    expect(summary?.clubTeams).toEqual([ECC_TEAM])
    expect(summary?.record).toMatchObject({ played: 2, won: 1, lost: 1 })
  })

  it('sorts by season (newest first), then by name', () => {
    const summaries = summariseCompetitions([
      makeCompletedFixture({ id: 1, competition: OLD_T20 }),
      makeCompletedFixture({ id: 2, competition: BUNDESLIGA }),
      makeCompletedFixture({ id: 3, competition: T20 }),
    ])

    expect(summaries.map((summary) => summary.competition.id)).toEqual([
      T20.id,
      BUNDESLIGA.id,
      OLD_T20.id,
    ])
  })

  it('lists no club teams when only opponents play', () => {
    const [summary] = summariseCompetitions([
      makeCompletedFixture({ competition: T20, teams: [NCC_TEAM, { ...NCC_TEAM, id: 9 }] }),
    ])

    expect(summary?.clubTeams).toEqual([])
  })
})

describe('buildCompetitionNavigation', () => {
  it('groups the latest season by club team', () => {
    const navigation = buildCompetitionNavigation(
      summariseCompetitions([
        makeCompletedFixture({ id: 1, competition: T20 }),
        makeCompletedFixture({ id: 2, competition: BUNDESLIGA }),
        makeCompletedFixture({
          id: 3,
          competition: REGIONALLIGA,
          teams: [ECC_II, NCC_TEAM],
          innings: [],
          result: { kind: 'no-result' },
        }),
        makeCompletedFixture({ id: 4, competition: OLD_T20 }),
      ]),
    )

    expect(navigation?.season).toBe('2026')
    expect(
      navigation?.teams.map(({ team, competitions }) => [
        team.shortName,
        competitions.map((c) => c.id),
      ]),
    ).toEqual([
      ['ECC-I', [T20.id, BUNDESLIGA.id]],
      ['ECC-II', [REGIONALLIGA.id]],
    ])
  })

  it('returns null without competitions', () => {
    expect(buildCompetitionNavigation([])).toBeNull()
  })
})
