export const STANDINGS_PATH = '/standings'

/** Unlocalised path of a competition's standings, e.g. "/standings/bcv-regionalliga-bayern-2026". */
export function getStandingsPath(slug: string): string {
  return `${STANDINGS_PATH}/${slug}`
}
