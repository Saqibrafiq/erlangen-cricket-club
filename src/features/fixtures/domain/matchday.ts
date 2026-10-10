import type { FixtureSummary, OutcomeSummary } from '../types'
import { summariseOutcomes } from './summarise-outcomes'

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
const MS_PER_MINUTE = 60_000
// "GMT+02:00", "GMT-03:30" or plain "GMT" for UTC.
const OFFSET_PATTERN = /GMT(?:([+-])(\d{2}):(\d{2}))?/
// The town of the club's ground: fixtures there are home games.
const HOME_TOWN = 'erlangen'
const RECENT_RESULTS = 3
const UPCOMING_AFTER_NEXT = 3

/** Calendar day (YYYY-MM-DD) of a fixture date in `timeZone`. Day-only dates are stored at noon UTC. */
export function getFixtureDay(date: string, timeZone: string): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(date))
}

function getOffsetMinutes(instant: Date, timeZone: string): number {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(instant)
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
  const [, sign, hours = '0', minutes = '0'] = OFFSET_PATTERN.exec(name) ?? []
  const offset = Number(hours) * 60 + Number(minutes)
  return sign === '-' ? -offset : offset
}

/**
 * The moment a fixture starts: its day plus the local start time ("HH:mm") in `timeZone`, e.g.
 * 11:00 in Erlangen. `null` while the start time is not known or not valid.
 */
export function getKickoff(date: string, startTime: string | null, timeZone: string): Date | null {
  const time = TIME_PATTERN.exec(startTime ?? '')
  if (!time) {
    return null
  }

  const [year, month, day] = getFixtureDay(date, timeZone).split('-').map(Number)
  const asIfUtc = Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1, Number(time[1]), Number(time[2]))
  // The offset at (about) that moment; correct except within the hour of a DST switch.
  const offset = getOffsetMinutes(new Date(asIfUtc), timeZone)

  return new Date(asIfUtc - offset * MS_PER_MINUTE)
}

export type VenueKind = 'home' | 'away'

/** Home when the ground is in Erlangen, away otherwise; `null` while the venue is not known. */
export function getVenueKind(venue: string | null): VenueKind | null {
  const name = venue?.trim().toLowerCase()
  if (!name) {
    return null
  }

  return name.includes(HOME_TOWN) ? 'home' : 'away'
}

export type Matchday = {
  /** The latest season with fixtures, e.g. "2026"; `null` without fixtures. */
  season: string | null
  /** The next club fixture still to be played in a featured competition. */
  next: FixtureSummary | null
  /** The club's other fixtures still to be played (any competition), soonest first. */
  upcoming: FixtureSummary[]
  /** The club's latest results, newest first. */
  recentResults: FixtureSummary[]
  /** The club's record in `season`. */
  record: OutcomeSummary
}

function isClubFixture(fixture: FixtureSummary): boolean {
  return fixture.teams.some((team) => team.isClubTeam)
}

// The home page counts down only to the competitions editors feature (e.g. T20 and Bundesliga).
function isFeaturedClubFixture(fixture: FixtureSummary): boolean {
  return isClubFixture(fixture) && fixture.competition.isFeatured
}

/**
 * What the home page shows about matches: the next fixture of a featured competition (scheduled,
 * not before `today`), the club's other upcoming fixtures, the latest results and the season record.
 *
 * @param scheduled Scheduled fixtures, soonest first.
 * @param played All other fixtures, newest first.
 * @param today The current day (YYYY-MM-DD) in the club's time zone.
 */
export function buildMatchday(
  scheduled: readonly FixtureSummary[],
  played: readonly FixtureSummary[],
  today: string,
  timeZone: string,
): Matchday {
  const ahead = scheduled.filter(
    (fixture) => isClubFixture(fixture) && getFixtureDay(fixture.date, timeZone) >= today,
  )
  const next = ahead.find(isFeaturedClubFixture) ?? null
  const upcoming = ahead.filter((fixture) => fixture !== next)
  const season =
    [...scheduled, ...played]
      .map((fixture) => fixture.competition.season)
      .sort((a, b) => b.localeCompare(a))[0] ?? null
  const seasonOutcomes = played
    .filter((fixture) => fixture.competition.season === season)
    .map((fixture) => fixture.clubOutcome)

  return {
    season,
    next,
    upcoming: upcoming.slice(0, UPCOMING_AFTER_NEXT),
    recentResults: played
      .filter((fixture) => fixture.status === 'completed' && fixture.clubOutcome !== null)
      .slice(0, RECENT_RESULTS),
    record: summariseOutcomes(seasonOutcomes),
  }
}
