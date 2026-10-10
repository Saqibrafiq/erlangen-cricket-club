import { describe, expect, it } from 'vitest'

import { getCountdown, getNextSeason } from './countdown'

const KICKOFF = new Date('2027-05-15T09:00:00.000Z')

describe('getCountdown', () => {
  it('splits the time left into days, hours, minutes and seconds', () => {
    expect(getCountdown(KICKOFF, new Date('2027-05-12T06:29:15.000Z'))).toEqual({
      days: 3,
      hours: 2,
      minutes: 30,
      seconds: 45,
    })
  })

  it('shows zero at kick-off', () => {
    expect(getCountdown(KICKOFF, new Date('2027-05-15T08:59:59.500Z'))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
  })

  it('is null once the match has started', () => {
    expect(getCountdown(KICKOFF, new Date('2027-05-15T09:00:01.000Z'))).toBeNull()
  })
})

describe('getNextSeason', () => {
  it('is the following year', () => {
    expect(getNextSeason('2026')).toBe('2027')
  })

  it.each([null, '2026/27', ''])('is unknown for "%s"', (season) => {
    expect(getNextSeason(season)).toBeNull()
  })
})
