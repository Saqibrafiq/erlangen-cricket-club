const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR

export type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Whole days, hours, minutes and seconds until `target`; `null` once it has started. */
export function getCountdown(target: Date, now: Date): Countdown | null {
  const total = Math.floor((target.getTime() - now.getTime()) / MS_PER_SECOND)
  if (total < 0) {
    return null
  }

  return {
    days: Math.floor(total / SECONDS_PER_DAY),
    hours: Math.floor((total % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: total % SECONDS_PER_MINUTE,
  }
}

/**
 * The season after `season` ("2026" → "2027"), for the "coming soon" message between seasons;
 * `null` when the season is not a plain year (e.g. "2026/27").
 */
export function getNextSeason(season: string | null): string | null {
  return season && /^\d{4}$/.test(season) ? String(Number(season) + 1) : null
}
