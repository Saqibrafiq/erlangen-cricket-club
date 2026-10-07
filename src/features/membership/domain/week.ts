import { WEEKDAYS, type ClubSession, type Weekday } from '../types'

// 1 January 2024 was a Monday; noon UTC keeps the date in every time zone.
const REFERENCE_MONDAY_UTC = Date.UTC(2024, 0, 1, 12)
const DAY_MS = 24 * 60 * 60 * 1000

/** A date falling on `day`, for formatting the weekday's name in any locale. */
export function getWeekdayDate(day: Weekday): Date {
  return new Date(REFERENCE_MONDAY_UTC + WEEKDAYS.indexOf(day) * DAY_MS)
}

export type WeekDaySummary = {
  day: Weekday
  /** Index of the first session on this day, or null if nothing happens. */
  sessionIndex: number | null
}

/** Monday to Sunday, each with the session it belongs to — the week at a glance. */
export function summariseWeek(sessions: readonly ClubSession[]): WeekDaySummary[] {
  return WEEKDAYS.map((day) => {
    const index = sessions.findIndex((session) => session.days.includes(day))
    return { day, sessionIndex: index === -1 ? null : index }
  })
}
