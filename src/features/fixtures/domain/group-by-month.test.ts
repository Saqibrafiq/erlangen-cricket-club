import { describe, expect, it } from 'vitest'

import { groupByMonth } from './group-by-month'

describe('groupByMonth', () => {
  it('groups consecutive items of the same month, keeping order', () => {
    const groups = groupByMonth([
      { id: 1, date: '2026-09-06T12:00:00.000Z' },
      { id: 2, date: '2026-09-05T12:00:00.000Z' },
      { id: 3, date: '2026-08-29T12:00:00.000Z' },
    ])

    expect(groups.map((group) => [group.key, group.items.map((item) => item.id)])).toEqual([
      ['2026-09', [1, 2]],
      ['2026-08', [3]],
    ])
    expect(groups[0]?.date).toBe('2026-09-06T12:00:00.000Z')
  })

  it('starts a new group when a month reappears after another (upcoming before results)', () => {
    const groups = groupByMonth([
      { date: '2026-10-10T12:00:00.000Z' },
      { date: '2026-09-06T12:00:00.000Z' },
      { date: '2026-10-01T12:00:00.000Z' },
    ])

    expect(groups.map((group) => group.key)).toEqual(['2026-10', '2026-09', '2026-10'])
  })

  it('returns no groups for no items', () => {
    expect(groupByMonth([])).toEqual([])
  })
})
