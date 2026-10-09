import type { Player } from '../types'

/**
 * First and last name initials for avatars without a photo: "Mohammad Yasub" → "MY",
 * "Ullas" → "U". Falls back to "?" for an empty name.
 */
export function getInitials(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/)
  if (!first) {
    return '?'
  }

  return `${first.charAt(0)}${rest.at(-1)?.charAt(0) ?? ''}`.toUpperCase()
}

export type NameParts = {
  /** Everything before the last word, or `null` for a single name such as "Ullas". */
  firstName: string | null
  lastName: string
}

/** Splits a name for display: "Mohammad Yasub" → first "Mohammad", last "Yasub". */
export function splitName(name: string): NameParts {
  const words = name.trim().split(/\s+/)
  const lastName = words.pop() ?? ''

  return { firstName: words.length > 0 ? words.join(' ') : null, lastName }
}

// Accents and case don't matter when searching ("jose" finds "José").
function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** Players whose name contains `query`, ignoring case and accents; all players for an empty query. */
export function searchPlayers(players: readonly Player[], query: string): Player[] {
  const needle = normalise(query)

  return players.filter((player) => normalise(player.name).includes(needle))
}

/** Whether the profile has playing details (role, batting or bowling style) to show. */
export function hasPlayingDetails(player: Player): boolean {
  return player.playingRole !== null || player.battingStyle !== null || player.bowlingStyle !== null
}

/**
 * Up to `count` other players for the "More players" strip: the ones after `slug` in squad order,
 * wrapping around, so every profile links to different teammates.
 */
export function pickTeammates(players: readonly Player[], slug: string, count: number): Player[] {
  const index = players.findIndex((player) => player.slug === slug)
  const rotated = [...players.slice(index + 1), ...players.slice(0, Math.max(index, 0))]

  return rotated.filter((player) => player.slug !== slug).slice(0, count)
}

export type PlayersJsonLdClub = {
  name: string
  url: string
}

function toAbsoluteUrl(url: string, siteUrl: string): string {
  return url.startsWith('http') ? url : `${siteUrl}${url}`
}

function buildPerson(player: Player, profileUrl: string, siteUrl: string) {
  return {
    '@type': 'Person',
    name: player.name,
    url: profileUrl,
    ...(player.photo ? { image: toAbsoluteUrl(player.photo.url, siteUrl) } : {}),
  }
}

/** schema.org `SportsTeam` listing the squad, for the players page. */
export function buildPlayersJsonLd(
  players: readonly Player[],
  club: PlayersJsonLdClub,
  getProfileUrl: (player: Player) => string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: club.name,
    sport: 'Cricket',
    url: club.url,
    athlete: players.map((player) => buildPerson(player, getProfileUrl(player), club.url)),
  }
}

/** schema.org `Person` for a player profile, as a member of the club. */
export function buildPlayerJsonLd(player: Player, profileUrl: string, club: PlayersJsonLdClub) {
  return {
    '@context': 'https://schema.org',
    ...buildPerson(player, profileUrl, club.url),
    memberOf: { '@type': 'SportsTeam', name: club.name, sport: 'Cricket', url: club.url },
  }
}
