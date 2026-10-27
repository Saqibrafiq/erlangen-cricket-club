import type { CompetitionStandings } from '../types'

/** Every season we have a competition for, newest first, e.g. `["2027", "2026"]`. */
export function getSeasons(tables: readonly CompetitionStandings[]): string[] {
  const seasons = new Set(tables.map(({ competition }) => competition.season))
  return [...seasons].toSorted((a, b) => b.localeCompare(a, undefined, { numeric: true }))
}

export type SeasonStandings = {
  /** The season shown; `null` when there are no competitions at all. */
  season: string | null
  /** All seasons, newest first, for the season switcher. */
  seasons: string[]
  /** The shown season's tables, in the order given. */
  tables: CompetitionStandings[]
  isCurrent: boolean
}

/**
 * One season's tables: the newest by default (the current season everywhere on the site), or the
 * requested one for the archive. An unknown season yields `season: null` and no tables.
 */
export function selectSeason(
  tables: readonly CompetitionStandings[],
  requested?: string,
): SeasonStandings {
  const seasons = getSeasons(tables)
  const [current = null] = seasons
  const season = requested === undefined ? current : (seasons.find((s) => s === requested) ?? null)

  return {
    season,
    seasons,
    tables: tables.filter(({ competition }) => competition.season === season),
    isCurrent: season !== null && season === current,
  }
}
