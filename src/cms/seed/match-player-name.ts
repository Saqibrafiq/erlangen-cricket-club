/**
 * Players the website lists under a shorter or different name than the league (CricClubs). Keys
 * are league names, values the site's names.
 */
export const SITE_NAMES_BY_LEAGUE_NAME: Readonly<Record<string, string>> = {
  'Abid Afg': 'Abid',
  'Ali Shaan': 'Ali Shan',
  'Arun Chaudhary': 'Arun',
  // Confirmed by the club: the same player.
  'Gaurav Joshi': 'Jimmy Joshi',
  'Ganesh Venkata Rao Yerravarapu': 'Ganesh',
  'Jatin Kuknoor': 'Jatin',
  'Karthikeyan Balaji': 'Karthikeyan',
  'Manjunath Reddy Pasuvula': 'Manjunath',
  'Manojkumar Senthilkumar': 'Manoj',
  'Parikshit Kulkarni': 'Parikshhit Kulkarni',
  'Rohit Venkata': 'Rohit',
  'Shivgovind Nandlal Gupta': 'Shiv Govind',
  'Siddhesh Chitnis': 'Siddhesh Chitesh',
  'Tarang Parikh': 'Tarang',
  'Tawananyasha Nathan Mwashita': 'Tawana',
  'Ullas Bharadwaj Deverakonda Ravi Babu': 'Ullas',
  'Vatsal Rajnikant Pujara': 'Vatsal Pujara',
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
