import { describe, expect, it } from 'vitest'

import { getMonogram } from './monogram'

describe('getMonogram', () => {
  it('drops the team number suffix', () => {
    expect(getMonogram('NCC-I')).toBe('NCC')
    expect(getMonogram('CCB-II')).toBe('CCB')
  })

  it('keeps at most three letters', () => {
    expect(getMonogram('SDTCC-II')).toBe('SDT')
    expect(getMonogram('AUXCC')).toBe('AUX')
  })

  it('ignores case, spaces and punctuation', () => {
    expect(getMonogram(' sv l ')).toBe('SVL')
  })

  it('falls back to a question mark for empty input', () => {
    expect(getMonogram('-')).toBe('?')
  })
})
