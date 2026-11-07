/**
 * Players the website lists under a shorter or different name than the league (CricClubs). Keys
 * are league names, values the site's names.
 */
export const SITE_NAMES_BY_LEAGUE_NAME: Readonly<Record<string, string>> = {
  'Arun Chaudhary': 'Arun',
  'Tarang Parikh': 'Tarang',
  'Ullas Bharadwaj Deverakonda Ravi Babu': 'Ullas',
  'Parikshit Kulkarni': 'Parikshhit Kulkarni',
}

type NamedPlayer = { id: number; name: string }

const normalize = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en')

/**
 * Finds the site's player for a league name: the same name (ignoring case and spacing), or the
 * site name the alias table maps it to.
 *
 * @returns The player, or `null` when the site does not list them yet.
 */
export function matchPlayerName<T extends NamedPlayer>(
  leagueName: string,
  players: readonly T[],
  aliases: Readonly<Record<string, string>> = SITE_NAMES_BY_LEAGUE_NAME,
): T | null {
  const candidates = [leagueName, aliases[leagueName]].filter(
    (name): name is string => name !== undefined,
  )
  for (const candidate of candidates) {
    const player = players.find(({ name }) => normalize(name) === normalize(candidate))
    if (player) return player
  }
  return null
}
