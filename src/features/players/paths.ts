export const PLAYERS_PATH = '/players'

export function getPlayerPath(slug: string): string {
  return `${PLAYERS_PATH}/${slug}`
}
