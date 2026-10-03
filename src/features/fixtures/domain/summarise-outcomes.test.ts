import { describe, expect, it } from 'vitest'

import { calculateWinRate, summariseOutcomes } from './summarise-outcomes'

describe('summariseOutcomes', () => {
  it('counts each club outcome', () => {
    expect(summariseOutcomes(['won', 'won', 'lost', 'tied', 'no-result'])).toEqual({
      played: 5,
      won: 2,
      lost: 1,
      tied: 1,
      noResult: 1,
    })
  })

  it('skips fixtures without a club outcome', () => {
    expect(summariseOutcomes([null, null])).toEqual({
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
    })
  })
})

describe('calculateWinRate', () => {
  it('divides wins by decided matches, excluding no-results', () => {
    expect(calculateWinRate(summariseOutcomes(['won', 'won', 'lost', 'tied', 'no-result']))).toBe(
      0.5,
    )
  })

  it('returns null when nothing has been decided', () => {
    expect(calculateWinRate(summariseOutcomes(['no-result', null]))).toBeNull()
  })
})
