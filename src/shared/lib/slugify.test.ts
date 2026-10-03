import { describe, expect, it } from 'vitest'

import { slugify } from './slugify'

describe('slugify', () => {
  it('transliterates German umlauts and drops punctuation', () => {
    expect(slugify('DCB-Bundesliga Südost: Bayern 2026')).toBe('dcb-bundesliga-suedost-bayern-2026')
  })

  it('transliterates ß and uppercase umlauts', () => {
    expect(slugify('Großer Ärger')).toBe('grosser-aerger')
  })

  it('strips other accents', () => {
    expect(slugify('Café Crème')).toBe('cafe-creme')
  })

  it('collapses separators and trims hyphens', () => {
    expect(slugify('  --BCV  T20 -- Regionalliga!  ')).toBe('bcv-t20-regionalliga')
  })
})
