import { describe, expect, it } from 'vitest'

import { ECC_TEAM, makeCompletedFixture, makeScheduledFixture, NCC_TEAM } from '../test-factories'
import type { FixtureTeam } from '../types'
import { buildMatchday, getFixtureDay, getKickoff, getVenueKind } from './matchday'

const BERLIN = 'Europe/Berlin'
const OTHER_TEAM: FixtureTeam = { id: 3, name: 'SVL-I', shortName: 'SVL-I', isClubTeam: false }

describe('getFixtureDay', () => {
  it('gives the calendar day in the club’s time zone', () => {
    expect(getFixtureDay('2027-05-15T12:00:00.000Z', BERLIN)).toBe('2027-05-15')
    // 23:30 UTC is already the next day in Berlin.
    expect(getFixtureDay('2027-05-15T23:30:00.000Z', BERLIN)).toBe('2027-05-16')
  })
})

describe('getKickoff', () => {
  it('turns the local start time into the right moment in summer and winter time', () => {
    expect(getKickoff('2027-05-15T12:00:00.000Z', '11:00', BERLIN)?.toISOString()).toBe(
      '2027-05-15T09:00:00.000Z',
    )
    expect(getKickoff('2027-01-16T12:00:00.000Z', '11:00', BERLIN)?.toISOString()).toBe(
      '2027-01-16T10:00:00.000Z',
    )
  })

  it('works in a time zone behind UTC', () => {
    expect(getKickoff('2027-05-15T12:00:00.000Z', '09:30', 'America/St_Johns')?.toISOString()).toBe(
      '2027-05-15T12:00:00.000Z',
    )
  })

  it('handles UTC itself', () => {
    expect(getKickoff('2027-05-15T12:00:00.000Z', '11:00', 'UTC')?.toISOString()).toBe(
      '2027-05-15T11:00:00.000Z',
    )
  })

  it.each([null, '', '25:00', '11.00', 'tbc'])(
    'is null without a valid start time (%s)',
    (time) => {
      expect(getKickoff('2027-05-15T12:00:00.000Z', time, BERLIN)).toBeNull()
    },
  )
})

describe('getVenueKind', () => {
  it('is a home game at a ground in Erlangen, ignoring case', () => {
    expect(getVenueKind('Erlangen Cricket Ground, Siedlerstraße 1, ERLANGEN')).toBe('home')
  })

  it('is an away game elsewhere', () => {
    expect(getVenueKind('Nürnberg Cricket Ground')).toBe('away')
  })

  it.each([null, '', '   '])('is unknown without a venue (%s)', (venue) => {
    expect(getVenueKind(venue)).toBeNull()
  })
})

describe('buildMatchday', () => {
  const TODAY = '2027-05-10'

  it('picks the next club fixture from today, then the ones after it', () => {
    const past = makeScheduledFixture({ id: 1, date: '2027-05-01T12:00:00.000Z' })
    const other = makeScheduledFixture({ id: 2, teams: [NCC_TEAM, OTHER_TEAM] })
    const today = makeScheduledFixture({ id: 3, date: '2027-05-10T12:00:00.000Z' })
    const later = [4, 5, 6, 7].map((id) =>
      makeScheduledFixture({ id, date: `2027-06-0${String(id)}T12:00:00.000Z` }),
    )

    const matchday = buildMatchday([past, other, today, ...later], [], TODAY, BERLIN)

    expect(matchday.next?.id).toBe(3)
    expect(matchday.upcoming.map((fixture) => fixture.id)).toEqual([4, 5, 6])
  })

  it('counts down only to featured competitions, listing the others as coming up', () => {
    const verbandsliga = makeScheduledFixture({
      id: 20,
      date: '2027-05-11T12:00:00.000Z',
      competition: {
        id: 6,
        slug: 'verbandsliga',
        name: 'Verbandsliga',
        season: '2027',
        isFeatured: false,
      },
    })
    const t20 = makeScheduledFixture({ id: 21, date: '2027-05-15T12:00:00.000Z' })

    const matchday = buildMatchday([verbandsliga, t20], [], TODAY, BERLIN)

    expect(matchday.next?.id).toBe(21)
    expect(matchday.upcoming.map((fixture) => fixture.id)).toEqual([20])
  })

  it('has no next match between seasons, but the latest results and the season record', () => {
    const won = makeCompletedFixture({ id: 10, teams: [ECC_TEAM, NCC_TEAM] })
    const lost = makeCompletedFixture({ id: 11 })
    const abandoned = makeCompletedFixture({ id: 12, status: 'abandoned', result: null })
    const lastSeason = makeCompletedFixture({
      id: 13,
      competition: { id: 9, slug: 'old', name: 'Old league', season: '2025', isFeatured: false },
    })

    const matchday = buildMatchday([], [won, lost, abandoned, lastSeason], TODAY, BERLIN)

    expect(matchday.next).toBeNull()
    expect(matchday.upcoming).toEqual([])
    expect(matchday.season).toBe('2026')
    expect(matchday.recentResults.map((fixture) => fixture.id)).toEqual([10, 11, 13])
    expect(matchday.record).toMatchObject({ played: 2, won: 1, lost: 1 })
  })

  it('takes the season from scheduled fixtures when the new season has started', () => {
    const matchday = buildMatchday(
      [makeScheduledFixture()],
      [makeCompletedFixture()],
      TODAY,
      BERLIN,
    )

    expect(matchday.season).toBe('2027')
    expect(matchday.record.played).toBe(0)
  })

  it('is empty without any fixtures', () => {
    expect(buildMatchday([], [], TODAY, BERLIN)).toEqual({
      season: null,
      next: null,
      upcoming: [],
      recentResults: [],
      record: { played: 0, won: 0, lost: 0, tied: 0, noResult: 0 },
    })
  })
})
