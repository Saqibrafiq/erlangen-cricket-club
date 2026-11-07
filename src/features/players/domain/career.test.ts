import { describe, expect, it } from 'vitest'

import type { BattingTotals, BowlingTotals } from '@/domain/cricket'

import type { PlayerSeasonRecord } from '../types'
import { summarizeCareer } from './career'

const batting = (overrides: Partial<BattingTotals> = {}): BattingTotals => ({
  matches: 10,
  innings: 10,
  notOuts: 0,
  runs: 100,
  balls: 100,
  highestScore: 30,
  isHighestScoreNotOut: false,
  hundreds: 0,
  fifties: 0,
  fours: 10,
  sixes: 2,
  ...overrides,
})

const bowling = (overrides: Partial<BowlingTotals> = {}): BowlingTotals => ({
  matches: 10,
  innings: 10,
  balls: 120,
  maidens: 0,
  runsConceded: 100,
  wickets: 5,
  bestFigures: { wickets: 2, runs: 10 },
  dotBalls: 40,
  fourWicketHauls: 0,
  fiveWicketHauls: 0,
  hatTricks: 0,
  wides: 3,
  noBalls: 0,
  ...overrides,
})

const season = (overrides: Partial<PlayerSeasonRecord>): PlayerSeasonRecord => ({
  id: 1,
  season: 2026,
  competition: 'club',
  format: 'all',
  team: null,
  batting: batting(),
  bowling: bowling(),
  ...overrides,
})

describe('summarizeCareer', () => {
  it('is empty for a player without seasons', () => {
    expect(summarizeCareer([])).toEqual({
      formats: [],
      clubSeasons: [],
      teamSeasons: [],
      districtSeasons: [],
      batting: null,
      bowling: null,
      matches: 0,
    })
  })

  it('lists club and district seasons apart, newest first', () => {
    const summary = summarizeCareer([
      season({ id: 1, season: 2025 }),
      season({ id: 2, season: 2026, competition: 'district' }),
      season({ id: 3, season: 2026 }),
    ])

    expect(summary.clubSeasons.map(({ id }) => id)).toEqual([3, 1])
    expect(summary.districtSeasons.map(({ id }) => id)).toEqual([2])
  })

  it('adds up only club seasons into the career totals', () => {
    const summary = summarizeCareer([
      season({ season: 2026, batting: batting({ runs: 219 }), bowling: bowling({ wickets: 24 }) }),
      season({ season: 2025, batting: batting({ runs: 149 }), bowling: bowling({ wickets: 13 }) }),
      season({
        competition: 'district',
        batting: batting({ runs: 60 }),
        bowling: bowling({ wickets: 1 }),
      }),
    ])

    expect(summary.batting?.runs).toBe(368)
    expect(summary.bowling?.wickets).toBe(37)
  })

  it('counts a season’s matches once, from whichever discipline played more', () => {
    const summary = summarizeCareer([
      season({ batting: batting({ matches: 12 }), bowling: bowling({ matches: 15 }) }),
      season({ batting: batting({ matches: 9 }), bowling: null }),
      season({ batting: null, bowling: bowling({ matches: 4 }) }),
    ])

    expect(summary.matches).toBe(28)
  })

  it('has no batting totals for a player who only bowled', () => {
    const summary = summarizeCareer([season({ batting: null })])
    expect(summary.batting).toBeNull()
    expect(summary.bowling).not.toBeNull()
  })

  it('keeps each team’s league record apart from the whole seasons, for all matches only', () => {
    const eccII = { id: 14, name: 'Erlangen Cricket Club II', shortName: 'ECC-II' }
    const eccI = { id: 1, name: 'Erlangen Cricket Club I', shortName: 'ECC-I' }
    const seasons = [
      season({ id: 1, batting: batting({ runs: 219 }) }),
      season({ id: 2, format: 'league', team: eccII, batting: batting({ runs: 180 }) }),
      season({ id: 3, format: 'league', team: eccI, batting: batting({ runs: 32 }) }),
    ]

    const all = summarizeCareer(seasons)
    expect(all.clubSeasons.map(({ id }) => id)).toEqual([1])
    expect(all.teamSeasons.map(({ id }) => id)).toEqual([3, 2])
    expect(all.batting?.runs).toBe(219)
    expect(all.formats).toEqual(['all'])
    expect(summarizeCareer(seasons, 't20').teamSeasons).toEqual([])
  })

  it('lists the formats the player has club records for, all matches first', () => {
    const summary = summarizeCareer([
      season({ format: 'fifty-over' }),
      season({ format: 't20' }),
      season({ format: 'all' }),
      season({ competition: 'district' }),
    ])
    expect(summary.formats).toEqual(['all', 't20', 'fifty-over'])
  })

  it('adds up one format at a time, leaving district seasons to all matches', () => {
    const seasons = [
      season({ format: 'all', batting: batting({ runs: 614 }) }),
      season({ format: 't20', batting: batting({ runs: 510 }) }),
      season({ competition: 'district', batting: batting({ runs: 60 }) }),
    ]

    const t20 = summarizeCareer(seasons, 't20')
    expect(t20.batting?.runs).toBe(510)
    expect(t20.districtSeasons).toEqual([])
    expect(summarizeCareer(seasons).batting?.runs).toBe(614)
    expect(summarizeCareer(seasons).districtSeasons).toHaveLength(1)
  })
})
