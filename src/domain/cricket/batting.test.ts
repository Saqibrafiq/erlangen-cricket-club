import { describe, expect, it } from 'vitest'

import { calculateBattingAverage, calculateStrikeRate } from './batting'

describe('calculateBattingAverage', () => {
  it('divides runs by dismissals', () => {
    expect(calculateBattingAverage(450, 10)).toBe(45)
  })

  it('returns a fractional average when runs do not divide evenly', () => {
    expect(calculateBattingAverage(100, 3)).toBeCloseTo(33.333, 3)
  })

  it('returns null average when player has never been dismissed', () => {
    expect(calculateBattingAverage(120, 0)).toBeNull()
  })

  it('returns zero when the batter was dismissed without scoring', () => {
    expect(calculateBattingAverage(0, 2)).toBe(0)
  })

  it('throws for negative runs', () => {
    expect(() => calculateBattingAverage(-1, 1)).toThrow(RangeError)
  })

  it('throws for non-integer dismissals', () => {
    expect(() => calculateBattingAverage(10, 1.5)).toThrow(/dismissals/)
  })
})

describe('calculateStrikeRate', () => {
  it('returns runs per 100 balls faced', () => {
    expect(calculateStrikeRate(75, 50)).toBe(150)
  })

  it('returns null when no balls have been faced', () => {
    expect(calculateStrikeRate(0, 0)).toBeNull()
  })

  it('throws for negative balls faced', () => {
    expect(() => calculateStrikeRate(10, -5)).toThrow(/ballsFaced/)
  })

  it('throws for NaN runs', () => {
    expect(() => calculateStrikeRate(Number.NaN, 10)).toThrow(RangeError)
  })
})
