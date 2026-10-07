import { describe, expect, it } from 'vitest'

import type { ClubSession } from '../types'
import { getWeekdayDate, summariseWeek } from './week'

const TRAINING: ClubSession = {
  title: 'Training',
  days: ['thursday'],
  startTime: '17:30',
  endTime: '20:00',
  venue: 'Erlangen Cricket Ground',
}
const MATCH_DAYS: ClubSession = {
  title: 'Match days',
  days: ['saturday', 'sunday'],
  startTime: '11:00',
  endTime: '18:00',
  venue: 'Erlangen Cricket Ground',
}

describe('getWeekdayDate', () => {
  it.each([
    ['monday', 1],
    ['thursday', 4],
    ['sunday', 0],
  ] as const)('returns a %s', (day, utcDay) => {
    expect(getWeekdayDate(day).getUTCDay()).toBe(utcDay)
  })
})

describe('summariseWeek', () => {
  it('marks each day with the session that takes place on it', () => {
    expect(summariseWeek([TRAINING, MATCH_DAYS])).toEqual([
      { day: 'monday', sessionIndex: null },
      { day: 'tuesday', sessionIndex: null },
      { day: 'wednesday', sessionIndex: null },
      { day: 'thursday', sessionIndex: 0 },
      { day: 'friday', sessionIndex: null },
      { day: 'saturday', sessionIndex: 1 },
      { day: 'sunday', sessionIndex: 1 },
    ])
  })

  it('keeps the first session when two share a day', () => {
    const summary = summariseWeek([MATCH_DAYS, { ...TRAINING, days: ['sunday'] }])

    expect(summary.find((entry) => entry.day === 'sunday')?.sessionIndex).toBe(0)
  })

  it('returns an empty week without sessions', () => {
    expect(summariseWeek([]).every((entry) => entry.sessionIndex === null)).toBe(true)
  })
})
