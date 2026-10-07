import { describe, expect, it } from 'vitest'

import type { Milestone } from '../types'
import { groupByYear, yearAnchor } from './group-by-year'

function milestone(year: number, title: string): Milestone {
  return { year, title, text: '…', image: null, link: null }
}

describe('groupByYear', () => {
  it('puts milestones of the same year together, in the given order', () => {
    const groups = groupByYear([
      milestone(2010, 'First players'),
      milestone(2015, 'Third title'),
      milestone(2015, 'Cricket for everyone'),
      milestone(2023, 'Champions again'),
    ])

    expect(groups.map((group) => [group.year, group.milestones.map((m) => m.title)])).toEqual([
      [2010, ['First players']],
      [2015, ['Third title', 'Cricket for everyone']],
      [2023, ['Champions again']],
    ])
  })

  it('returns no years without milestones', () => {
    expect(groupByYear([])).toEqual([])
  })
})

describe('yearAnchor', () => {
  it('names the in-page target of a year', () => {
    expect(yearAnchor(2015)).toBe('year-2015')
  })
})
