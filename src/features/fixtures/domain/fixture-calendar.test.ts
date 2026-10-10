import { describe, expect, it } from 'vitest'

import { makeScheduledFixture } from '../test-factories'
import { buildFixtureCalendar, type FixtureCalendarOptions } from './fixture-calendar'

const OPTIONS: FixtureCalendarOptions = {
  kickoff: new Date('2027-05-15T09:00:00.000Z'),
  day: '2027-05-15',
  url: 'https://example.org/fixtures/bcv-t20-regionalliga-bayern-2027',
  host: 'example.org',
  now: new Date('2027-05-01T08:30:00.000Z'),
}

function lines(calendar: string): string[] {
  // Unfold continuation lines (RFC 5545) before checking content.
  return calendar.replace(/\r\n /g, '').split('\r\n')
}

describe('buildFixtureCalendar', () => {
  it('creates a timed event from kick-off, lasting a match day', () => {
    const calendar = buildFixtureCalendar(makeScheduledFixture(), OPTIONS)

    expect(lines(calendar)).toEqual(
      expect.arrayContaining([
        'BEGIN:VCALENDAR',
        'UID:fixture-100@example.org',
        'DTSTAMP:20270501T083000Z',
        'DTSTART:20270515T090000Z',
        'DTEND:20270515T160000Z',
        'SUMMARY:Erlangen Cricket Club I vs NCC-I',
        'LOCATION:Erlangen Cricket Ground',
        'END:VCALENDAR',
      ]),
    )
    expect(calendar.endsWith('\r\n')).toBe(true)
  })

  it('creates an all-day event while the start time is not known, also at month end', () => {
    const calendar = buildFixtureCalendar(makeScheduledFixture(), {
      ...OPTIONS,
      kickoff: null,
      day: '2027-05-31',
    })

    expect(lines(calendar)).toEqual(
      expect.arrayContaining(['DTSTART;VALUE=DATE:20270531', 'DTEND;VALUE=DATE:20270601']),
    )
  })

  it('escapes special characters and leaves out an unknown venue', () => {
    const calendar = buildFixtureCalendar(
      makeScheduledFixture({
        venue: null,
        competition: {
          id: 1,
          slug: 'cup',
          name: 'Cup; Final, Day\\1',
          season: '2027',
          isFeatured: false,
        },
      }),
      OPTIONS,
    )

    expect(calendar).not.toContain('LOCATION:')
    expect(lines(calendar)).toContain(
      'DESCRIPTION:Cup\\; Final\\, Day\\\\1\\nhttps://example.org/fixtures/bcv-t20-regionalliga-bayern-2027',
    )
  })

  it('folds long lines at 75 characters', () => {
    const calendar = buildFixtureCalendar(makeScheduledFixture(), OPTIONS)

    for (const line of calendar.split('\r\n')) {
      expect(line.length).toBeLessThanOrEqual(75)
    }
  })
})
