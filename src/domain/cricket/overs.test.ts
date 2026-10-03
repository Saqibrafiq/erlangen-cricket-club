import { describe, expect, it } from 'vitest'

import { formatOvers, isValidOvers, parseOvers } from './overs'

describe('parseOvers', () => {
  it('converts complete overs to balls', () => {
    expect(parseOvers('20')).toBe(120)
  })

  it('treats the digit after the dot as balls, not tenths', () => {
    expect(parseOvers('19.2')).toBe(116)
  })

  it('ignores surrounding whitespace', () => {
    expect(parseOvers(' 8 ')).toBe(48)
  })

  it('accepts zero overs', () => {
    expect(parseOvers('0')).toBe(0)
  })

  it('rejects six or more balls after the dot', () => {
    expect(() => parseOvers('19.6')).toThrow(RangeError)
  })

  it('rejects non-numeric input', () => {
    expect(() => parseOvers('twenty')).toThrow(/Invalid overs/)
  })
})

describe('isValidOvers', () => {
  it('accepts cricket notation', () => {
    expect(isValidOvers('14.5')).toBe(true)
  })

  it('rejects decimal overs beyond five balls', () => {
    expect(isValidOvers('14.7')).toBe(false)
  })
})

describe('formatOvers', () => {
  it('formats complete overs without a ball suffix', () => {
    expect(formatOvers(120)).toBe('20')
  })

  it('formats a partial over with its balls', () => {
    expect(formatOvers(116)).toBe('19.2')
  })

  it('round-trips with parseOvers', () => {
    expect(formatOvers(parseOvers('15.5'))).toBe('15.5')
  })

  it('throws for negative balls', () => {
    expect(() => formatOvers(-1)).toThrow(RangeError)
  })
})
