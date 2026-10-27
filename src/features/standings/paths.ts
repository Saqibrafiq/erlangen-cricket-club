export const STANDINGS_PATH = '/standings'

/** Unlocalised path of a competition's standings, e.g. "/standings/bcv-regionalliga-bayern-2026". */
export function getStandingsPath(slug: string): string {
  return `${STANDINGS_PATH}/${slug}`
}

/** A past season's tables, e.g. "/standings/season/2026"; the current season is on STANDINGS_PATH. */
export function getStandingsSeasonPath(season: string): string {
  return `${STANDINGS_PATH}/season/${season}`
}
