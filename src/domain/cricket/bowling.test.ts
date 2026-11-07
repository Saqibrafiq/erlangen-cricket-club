import { describe, expect, it } from 'vitest'

import {
  calculateBowlingAverage,
  calculateBowlingStrikeRate,
  calculateEconomyRate,
  formatBowlingFigures,
  isBetterBowlingFigures,
} from './bowling'

describe('calculateBowlingAverage', () => {
  it('divides runs conceded by wickets', () => {
    expect(calculateBowlingAverage(682, 56)).toBeCloseTo(12.18, 2)
  })

  it('returns null when the bowler has not taken a wicket', () => {
    expect(calculateBowlingAverage(40, 0)).toBeNull()
  })

  it('rejects negative or fractional input', () => {
    expect(() => calculateBowlingAverage(-1, 2)).toThrow(RangeError)
    expect(() => calculateBowlingAverage(10, 1.5)).toThrow(RangeError)
  })
})

describe('calculateEconomyRate', () => {
  it('gives runs per six-ball over', () => {
    // 110.1 overs = 661 balls.
    expect(calculateEconomyRate(682, 661)).toBeCloseTo(6.19, 2)
  })

  it('returns null when no balls have been bowled', () => {
    expect(calculateEconomyRate(0, 0)).toBeNull()
  })

  it('rejects negative input', () => {
    expect(() => calculateEconomyRate(10, -6)).toThrow(RangeError)
  })
})

describe('calculateBowlingStrikeRate', () => {
  it('gives balls per wicket', () => {
    expect(calculateBowlingStrikeRate(661, 56)).toBeCloseTo(11.8, 1)
  })

  it('returns null when the bowler has not taken a wicket', () => {
    expect(calculateBowlingStrikeRate(24, 0)).toBeNull()
  })

  it('rejects fractional input', () => {
    expect(() => calculateBowlingStrikeRate(24.5, 1)).toThrow(RangeError)
  })
})

describe('isBetterBowlingFigures', () => {
  it('prefers more wickets, whatever the runs', () => {
    expect(isBetterBowlingFigures({ wickets: 5, runs: 40 }, { wickets: 4, runs: 10 })).toBe(true)
    expect(isBetterBowlingFigures({ wickets: 3, runs: 5 }, { wickets: 4, runs: 50 })).toBe(false)
  })

  it('prefers fewer runs when the wickets are equal', () => {
    expect(isBetterBowlingFigures({ wickets: 3, runs: 9 }, { wickets: 3, runs: 20 })).toBe(true)
    expect(isBetterBowlingFigures({ wickets: 3, runs: 20 }, { wickets: 3, runs: 9 })).toBe(false)
  })

  it('does not call equal figures better', () => {
    expect(isBetterBowlingFigures({ wickets: 2, runs: 15 }, { wickets: 2, runs: 15 })).toBe(false)
  })
})

describe('formatBowlingFigures', () => {
  it('prints wickets/runs', () => {
    expect(formatBowlingFigures({ wickets: 6, runs: 12 })).toBe('6/12')
  })
})
