import { describe, expect, it } from 'vitest'

import { formatGround } from './ground'

describe('formatGround', () => {
  it('joins name and address', () => {
    expect(
      formatGround({ name: 'Erlangen Cricket Ground', address: 'Siedlerstraße 1, Erlangen' }),
    ).toBe('Erlangen Cricket Ground, Siedlerstraße 1, Erlangen')
  })

  it('is the name alone without an address, and nothing without a ground', () => {
    expect(formatGround({ name: 'Tennenlohe', address: null })).toBe('Tennenlohe')
    expect(formatGround(null)).toBeNull()
  })
})
