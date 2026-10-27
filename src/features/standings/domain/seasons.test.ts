import { describe, expect, it } from 'vitest'

import type { CompetitionStandings } from '../types'
import { getSeasons, selectSeason } from './seasons'

function table(id: number, season: string): CompetitionStandings {
  return {
    competition: { id, slug: `c-${String(id)}`, name: `League ${String(id)}`, season },
    rows: [],
  }
}

const TABLES = [table(1, '2026'), table(2, '2027'), table(3, '2026'), table(4, '2027')]

describe('getSeasons', () => {
  it('lists each season once, newest first', () => {
    expect(getSeasons(TABLES)).toEqual(['2027', '2026'])
  })
})

describe('selectSeason', () => {
  it('shows the newest season by default, in the order given', () => {
    expect(selectSeason(TABLES)).toEqual({
      season: '2027',
      seasons: ['2027', '2026'],
      tables: [table(2, '2027'), table(4, '2027')],
      isCurrent: true,
    })
  })

  it('shows a past season on request', () => {
    expect(selectSeason(TABLES, '2026')).toMatchObject({
      season: '2026',
      tables: [table(1, '2026'), table(3, '2026')],
      isCurrent: false,
    })
  })

  it('shows nothing for an unknown season or without competitions', () => {
    expect(selectSeason(TABLES, '1999')).toMatchObject({
      season: null,
      tables: [],
      isCurrent: false,
    })
    expect(selectSeason([])).toEqual({ season: null, seasons: [], tables: [], isCurrent: false })
  })
})
