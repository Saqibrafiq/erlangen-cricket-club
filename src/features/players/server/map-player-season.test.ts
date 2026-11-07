import { describe, expect, it } from 'vitest'

import type { PlayerSeason } from '@/payload-types'

import { mapPlayerSeason } from './map-player-season'

const TEAM = {
  id: 14,
  name: 'Erlangen Cricket Club II',
  shortName: 'ECC-II',
  updatedAt: '',
  createdAt: '',
}

const doc = (overrides: Partial<PlayerSeason> = {}): PlayerSeason => ({
  id: 7,
  player: 3,
  season: 2026,
  competition: 'club',
  format: 'all',
  team: null,
  batting: {
    matches: 24,
    innings: 24,
    notOuts: 2,
    runs: 614,
    balls: 349,
    highestScore: 140,
    isHighestScoreNotOut: false,
    hundreds: 1,
    fifties: 2,
    fours: 64,
    sixes: 38,
  },
  bowling: {
    matches: 25,
    innings: 25,
    overs: '110.1',
    maidens: 5,
    runsConceded: 682,
    wickets: 56,
    bestWickets: 6,
    bestRuns: 12,
    dotBalls: 362,
    fourWicketHauls: 3,
    fiveWicketHauls: 1,
    hatTricks: 1,
    wides: 42,
    noBalls: 0,
  },
  updatedAt: '',
  createdAt: '',
  ...overrides,
})

describe('mapPlayerSeason', () => {
  it('maps a season with batting, bowling and its club team', () => {
    const season = mapPlayerSeason(doc())

    expect(season).toMatchObject({
      id: 7,
      season: 2026,
      competition: 'club',
      format: 'all',
      team: null,
      batting: { matches: 24, runs: 614, highestScore: 140, isHighestScoreNotOut: false },
      bowling: { matches: 25, balls: 661, wickets: 56, bestFigures: { wickets: 6, runs: 12 } },
    })
  })

  it('has no batting or bowling when the season’s groups are empty', () => {
    const season = mapPlayerSeason(doc({ batting: {}, bowling: { matches: null } }))
    expect(season.batting).toBeNull()
    expect(season.bowling).toBeNull()
  })

  it('treats missing counts as zero and unknown best figures as none', () => {
    const season = mapPlayerSeason(
      doc({
        batting: { matches: 1 },
        bowling: { matches: 1, bestWickets: 2 },
      }),
    )
    expect(season.batting).toMatchObject({ innings: 0, runs: 0, isHighestScoreNotOut: false })
    expect(season.bowling).toMatchObject({ balls: 0, wickets: 0, bestFigures: null })
  })

  it('counts invalid overs as no balls instead of failing', () => {
    expect(mapPlayerSeason(doc({ bowling: { matches: 1, overs: '3.7' } })).bowling?.balls).toBe(0)
  })

  it('maps the club team of a per-team record, and leaves an unpopulated team out', () => {
    const season = mapPlayerSeason(doc({ format: 'league', team: TEAM }))
    expect(season.team).toEqual({ id: 14, name: 'Erlangen Cricket Club II', shortName: 'ECC-II' })
    expect(mapPlayerSeason(doc({ team: 14 })).team).toBeNull()
  })
})
