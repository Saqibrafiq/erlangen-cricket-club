import { describe, expect, it } from 'vitest'

import { pickSeason, sortSeasons } from './seasons'

describe('sortSeasons', () => {
  it('lists each season once, newest first', () => {
    expect(sortSeasons(['2026', '2027', '2026', '2025'])).toEqual(['2027', '2026', '2025'])
  })
})

describe('pickSeason', () => {
  const SEASONS = ['2027', '2026']

  it('is the newest season by default', () => {
    expect(pickSeason(SEASONS)).toEqual({ season: '2027', isCurrent: true })
  })

  it('is a past season on request, and nothing for an unknown one', () => {
    expect(pickSeason(SEASONS, '2026')).toEqual({ season: '2026', isCurrent: false })
    expect(pickSeason(SEASONS, '1999')).toEqual({ season: null, isCurrent: false })
    expect(pickSeason([])).toEqual({ season: null, isCurrent: false })
  })
})
