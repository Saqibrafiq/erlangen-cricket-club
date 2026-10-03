export const FIXTURES_PATH = '/fixtures'

/** Unlocalised path of a competition page, e.g. "/fixtures/bcv-regionalliga-bayern-2026". */
export function getCompetitionPath(slug: string): string {
  return `${FIXTURES_PATH}/${slug}`
}
