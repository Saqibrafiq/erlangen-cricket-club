export const FIXTURES_PATH = '/fixtures'

/** Unlocalised path of a competition page, e.g. "/fixtures/bcv-regionalliga-bayern-2026". */
export function getCompetitionPath(slug: string): string {
  return `${FIXTURES_PATH}/${slug}`
}

/** A past season's fixtures, e.g. "/fixtures/season/2026"; the current season is on FIXTURES_PATH. */
export function getFixturesSeasonPath(season: string): string {
  return `${FIXTURES_PATH}/season/${season}`
}
