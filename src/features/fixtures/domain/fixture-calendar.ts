import type { FixtureSummary } from '../types'

// Match days run 11:00–18:00 (club schedule); used as the event length when the start is known.
const MATCH_DURATION_HOURS = 7
const MS_PER_HOUR = 3_600_000
// RFC 5545: content lines are folded at 75 octets.
const MAX_LINE_LENGTH = 75

export type FixtureCalendarOptions = {
  /** Kick-off, or `null` for an all-day event when the start time is not known. */
  kickoff: Date | null
  /** The fixture's day (YYYY-MM-DD) in the club's time zone. */
  day: string
  /** Absolute URL of the fixture's page, linked from the event. */
  url: string
  /** Domain for the event's unique id, e.g. "erlangen-cricket-club.de". */
  host: string
  /** When the file is generated (the event's DTSTAMP). */
  now: Date
}

function toUtcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function fold(line: string): string {
  const parts: string[] = []
  for (let start = 0; start < line.length; start += MAX_LINE_LENGTH - 1) {
    parts.push(line.slice(start, start + MAX_LINE_LENGTH - 1))
  }
  return parts.join('\r\n ')
}

function nextDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

/** An iCalendar (.ics) file with the fixture, so players can add it to their phone's calendar. */
export function buildFixtureCalendar(
  fixture: FixtureSummary,
  options: FixtureCalendarOptions,
): string {
  const { kickoff, day, url, host, now } = options
  const [team1, team2] = fixture.teams
  const when = kickoff
    ? [
        `DTSTART:${toUtcStamp(kickoff)}`,
        `DTEND:${toUtcStamp(new Date(kickoff.getTime() + MATCH_DURATION_HOURS * MS_PER_HOUR))}`,
      ]
    : [
        `DTSTART;VALUE=DATE:${day.replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${nextDay(day).replace(/-/g, '')}`,
      ]

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${host}//Fixtures//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:fixture-${String(fixture.id)}@${host}`,
    `DTSTAMP:${toUtcStamp(now)}`,
    ...when,
    `SUMMARY:${escapeText(`${team1.name} vs ${team2.name}`)}`,
    `DESCRIPTION:${escapeText(`${fixture.competition.name}\n${url}`)}`,
    ...(fixture.venue ? [`LOCATION:${escapeText(fixture.venue)}`] : []),
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return `${lines.map(fold).join('\r\n')}\r\n`
}
