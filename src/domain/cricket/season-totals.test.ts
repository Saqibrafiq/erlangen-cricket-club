import { describe, expect, it } from 'vitest'

import {
  type BattingTotals,
  type BowlingTotals,
  getDismissals,
  subtractBattingTotals,
  subtractBowlingTotals,
  sumBattingTotals,
  sumBowlingTotals,
} from './season-totals'

const batting = (overrides: Partial<BattingTotals> = {}): BattingTotals => ({
  matches: 10,
  innings: 9,
  notOuts: 1,
  runs: 200,
  balls: 180,
  highestScore: 50,
  isHighestScoreNotOut: false,
  hundreds: 0,
  fifties: 1,
  fours: 20,
  sixes: 5,
  ...overrides,
})

const bowling = (overrides: Partial<BowlingTotals> = {}): BowlingTotals => ({
  matches: 10,
  innings: 10,
  balls: 240,
  maidens: 2,
  runsConceded: 250,
  wickets: 12,
  bestFigures: { wickets: 3, runs: 20 },
  dotBalls: 100,
  fourWicketHauls: 0,
  fiveWicketHauls: 0,
  hatTricks: 0,
  wides: 10,
  noBalls: 1,
  ...overrides,
})

describe('getDismissals', () => {
  it('counts innings in which the batter was out', () => {
    expect(getDismissals({ innings: 24, notOuts: 2 })).toBe(22)
  })

  it('never goes below zero, even for inconsistent records', () => {
    expect(getDismissals({ innings: 1, notOuts: 2 })).toBe(0)
  })
})

describe('sumBattingTotals', () => {
  it('returns null when there are no records', () => {
    expect(sumBattingTotals([])).toBeNull()
  })

  it('returns a single record unchanged', () => {
    const season = batting()
    expect(sumBattingTotals([season])).toEqual(season)
  })

  it('sums the counts and keeps the highest score across seasons', () => {
    const career = sumBattingTotals([
      batting({ runs: 614, highestScore: 140, hundreds: 1 }),
      batting({ runs: 455, highestScore: 93, fifties: 3 }),
    ])

    expect(career).toMatchObject({
      matches: 20,
      innings: 18,
      notOuts: 2,
      runs: 1069,
      balls: 360,
      highestScore: 140,
      hundreds: 1,
      fifties: 4,
      fours: 40,
      sixes: 10,
    })
  })

  it('takes a later season’s highest score when it is higher', () => {
    const career = sumBattingTotals([
      batting({ highestScore: 40 }),
      batting({ highestScore: 83, isHighestScoreNotOut: true }),
    ])
    expect(career).toMatchObject({ highestScore: 83, isHighestScoreNotOut: true })
  })

  it('counts a not-out score higher than the same score when out', () => {
    const notOutLater = sumBattingTotals([
      batting({ highestScore: 76 }),
      batting({ highestScore: 76, isHighestScoreNotOut: true }),
    ])
    expect(notOutLater?.isHighestScoreNotOut).toBe(true)

    const notOutFirst = sumBattingTotals([
      batting({ highestScore: 76, isHighestScoreNotOut: true }),
      batting({ highestScore: 76 }),
    ])
    expect(notOutFirst?.isHighestScoreNotOut).toBe(true)
  })
})

describe('sumBowlingTotals', () => {
  it('returns null when there are no records', () => {
    expect(sumBowlingTotals([])).toBeNull()
  })

  it('sums the counts and keeps the best figures across seasons', () => {
    const career = sumBowlingTotals([
      bowling({ wickets: 56, bestFigures: { wickets: 6, runs: 12 }, fiveWicketHauls: 1 }),
      bowling({ wickets: 31, bestFigures: { wickets: 3, runs: 9 } }),
    ])

    expect(career).toMatchObject({
      matches: 20,
      innings: 20,
      balls: 480,
      maidens: 4,
      runsConceded: 500,
      wickets: 87,
      bestFigures: { wickets: 6, runs: 12 },
      dotBalls: 200,
      fiveWicketHauls: 1,
      wides: 20,
      noBalls: 2,
    })
  })

  it('takes a later season’s figures when they are better', () => {
    const career = sumBowlingTotals([
      bowling({ bestFigures: { wickets: 3, runs: 20 } }),
      bowling({ bestFigures: { wickets: 5, runs: 8 }, hatTricks: 1, fourWicketHauls: 1 }),
    ])
    expect(career).toMatchObject({
      bestFigures: { wickets: 5, runs: 8 },
      hatTricks: 1,
      fourWicketHauls: 1,
    })
  })

  it('keeps the known figures when a season has none recorded', () => {
    expect(
      sumBowlingTotals([
        bowling({ bestFigures: null }),
        bowling({ bestFigures: { wickets: 2, runs: 30 } }),
      ])?.bestFigures,
    ).toEqual({ wickets: 2, runs: 30 })
    expect(
      sumBowlingTotals([
        bowling({ bestFigures: { wickets: 2, runs: 30 } }),
        bowling({ bestFigures: null }),
      ])?.bestFigures,
    ).toEqual({ wickets: 2, runs: 30 })
  })
})

describe('subtractBattingTotals', () => {
  it('leaves the matches outside the parts, e.g. friendlies after the league teams', () => {
    const season = batting({ matches: 22, innings: 13, notOuts: 4, runs: 219, balls: 233 })
    const teams = [
      batting({
        matches: 6,
        innings: 1,
        notOuts: 0,
        runs: 32,
        balls: 20,
        fifties: 0,
        fours: 2,
        sixes: 3,
      }),
      batting({ matches: 15, innings: 11, notOuts: 4, runs: 180, balls: 202, fours: 18, sixes: 1 }),
    ]

    expect(subtractBattingTotals(season, teams)).toMatchObject({
      matches: 1,
      innings: 1,
      notOuts: 0,
      runs: 7,
      balls: 11,
    })
  })

  it('returns null when nothing is left', () => {
    expect(subtractBattingTotals(batting(), [batting()])).toBeNull()
  })

  it('returns null when the parts add up to more than the whole', () => {
    expect(
      subtractBattingTotals(batting({ runs: 10 }), [batting({ matches: 1, runs: 20 })]),
    ).toBeNull()
  })
})

describe('subtractBowlingTotals', () => {
  it('leaves the bowling outside the parts', () => {
    const season = bowling({ matches: 22, innings: 22, balls: 470, runsConceded: 620, wickets: 25 })
    const teams = [
      bowling({ matches: 21, innings: 21, balls: 464, runsConceded: 615, wickets: 24 }),
    ]

    expect(subtractBowlingTotals(season, teams)).toMatchObject({
      matches: 1,
      innings: 1,
      balls: 6,
      runsConceded: 5,
      wickets: 1,
    })
  })

  it('returns null when only matches without an innings are left (played but did not bowl)', () => {
    expect(subtractBowlingTotals(bowling({ matches: 11 }), [bowling()])).toBeNull()
  })
})
