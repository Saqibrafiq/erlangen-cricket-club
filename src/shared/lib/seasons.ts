/** Each season once, newest first, e.g. `["2027", "2026"]`. */
export function sortSeasons(values: Iterable<string>): string[] {
  return [...new Set(values)].toSorted((a, b) => b.localeCompare(a, undefined, { numeric: true }))
}

export type PickedSeason = {
  /** The season to show; `null` for an unknown season or without any. */
  season: string | null
  isCurrent: boolean
}

/**
 * The season a page shows: the newest (current) one by default, or the requested one for the
 * archive. The current season is the same everywhere on the site, so pages never disagree.
 */
export function pickSeason(seasons: readonly string[], requested?: string): PickedSeason {
  const [current = null] = seasons
  const season = requested === undefined ? current : (seasons.find((s) => s === requested) ?? null)
  return { season, isCurrent: season !== null && season === current }
}
