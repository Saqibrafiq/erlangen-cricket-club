import { describe, expect, it } from 'vitest'

import { makeCompletedFixture, makeScheduledFixture, NCC_TEAM } from '../test-factories'
import {
  countByCategory,
  countByResult,
  filterFixtures,
  getFixtureCategory,
  NO_FILTERS,
  parseFixtureFilters,
  serializeFixtureFilters,
  type Filterable,
} from './fixture-filters'

describe('getFixtureCategory', () => {
  it('treats scheduled fixtures as upcoming', () => {
    expect(getFixtureCategory(makeScheduledFixture())).toBe('upcoming')
  })

  it('treats played results, including DLS and ties, as completed', () => {
    expect(getFixtureCategory(makeCompletedFixture())).toBe('completed')
    expect(getFixtureCategory(makeCompletedFixture({ result: { kind: 'tie', isDls: true } }))).toBe(
      'completed',
    )
  })

  it('separates forfeits from walkovers', () => {
    expect(
      getFixtureCategory(
        makeCompletedFixture({ result: { kind: 'forfeit', winnerTeamId: NCC_TEAM.id } }),
      ),
    ).toBe('forfeit')
    expect(
      getFixtureCategory(
        makeCompletedFixture({ result: { kind: 'walkover', winnerTeamId: NCC_TEAM.id } }),
      ),
    ).toBe('walkover')
  })

  it('groups abandoned, cancelled and no-result matches as abandoned', () => {
    expect(getFixtureCategory(makeScheduledFixture({ status: 'abandoned' }))).toBe('abandoned')
    expect(getFixtureCategory(makeScheduledFixture({ status: 'cancelled' }))).toBe('abandoned')
    expect(getFixtureCategory(makeCompletedFixture({ result: { kind: 'no-result' } }))).toBe(
      'abandoned',
    )
  })
})

describe('parseFixtureFilters', () => {
  const SLUGS = ['bcv-t20-2026', 'dcb-bl-2026']

  it('reads a known competition, category and result', () => {
    expect(
      parseFixtureFilters(
        new URLSearchParams('competition=dcb-bl-2026&status=forfeit&result=lost'),
        SLUGS,
      ),
    ).toEqual({ competition: 'dcb-bl-2026', category: 'forfeit', result: 'lost' })
  })

  it('falls back to all for unknown values', () => {
    expect(
      parseFixtureFilters(
        new URLSearchParams('competition=nope&status=postponed&result=tied'),
        SLUGS,
      ),
    ).toEqual(NO_FILTERS)
  })

  it('returns no filters for an empty query', () => {
    expect(parseFixtureFilters(new URLSearchParams(), SLUGS)).toEqual(NO_FILTERS)
  })
})

describe('serializeFixtureFilters', () => {
  it('writes only the filters that are set', () => {
    expect(serializeFixtureFilters({ ...NO_FILTERS, category: 'walkover', result: 'won' })).toBe(
      'status=walkover&result=won',
    )
  })

  it('round-trips through parseFixtureFilters', () => {
    const filters = { competition: 'bcv-t20-2026', category: 'upcoming' as const, result: null }
    expect(
      parseFixtureFilters(new URLSearchParams(serializeFixtureFilters(filters)), ['bcv-t20-2026']),
    ).toEqual(filters)
  })

  it('is empty without filters', () => {
    expect(serializeFixtureFilters(NO_FILTERS)).toBe('')
  })
})

describe('filterFixtures, countByCategory and countByResult', () => {
  const ITEMS: Filterable[] = [
    { competition: 'a', category: 'completed', outcome: 'won' },
    { competition: 'a', category: 'forfeit', outcome: 'lost' },
    { competition: 'b', category: 'completed', outcome: 'tied' },
    { competition: 'b', category: 'upcoming', outcome: null },
    { competition: 'b', category: 'forfeit', outcome: 'won' },
  ]

  it('combines competition and category filters', () => {
    expect(
      filterFixtures(ITEMS, { ...NO_FILTERS, competition: 'b', category: 'completed' }),
    ).toEqual([ITEMS[2]])
  })

  it('filters by the club result, independent of category', () => {
    expect(filterFixtures(ITEMS, { ...NO_FILTERS, result: 'won' })).toEqual([ITEMS[0], ITEMS[4]])
    expect(filterFixtures(ITEMS, { ...NO_FILTERS, category: 'forfeit', result: 'lost' })).toEqual([
      ITEMS[1],
    ])
  })

  it('returns everything without filters', () => {
    expect(filterFixtures(ITEMS, NO_FILTERS)).toHaveLength(5)
  })

  it('counts every category, including empty ones', () => {
    expect(countByCategory(ITEMS)).toEqual({
      upcoming: 1,
      completed: 2,
      abandoned: 0,
      walkover: 0,
      forfeit: 2,
    })
  })

  it('counts wins and losses, ignoring ties and unplayed fixtures', () => {
    expect(countByResult(ITEMS)).toEqual({ won: 2, lost: 1 })
  })
})
