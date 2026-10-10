import type { Player } from '@/features/players'

// One line-up on the squad stage.
const FEATURED_PLAYERS = 7

/**
 * Players for the home page's squad line-up, in squad order, at most one line-up: the ones editors
 * picked ("Show in the home page line-up"); until anyone is picked, those with a photo first.
 */
export function pickFeaturedPlayers(players: readonly Player[]): Player[] {
  const picked = players.filter((player) => player.isFeaturedOnHome)
  if (picked.length > 0) {
    return picked.slice(0, FEATURED_PLAYERS)
  }
  const withPhoto = players.filter((player) => player.photo !== null)
  const withoutPhoto = players.filter((player) => player.photo === null)

  return [...withPhoto, ...withoutPhoto].slice(0, FEATURED_PLAYERS)
}

/** Google Maps directions to a ground given by name or address (no tracking embed, just a link). */
export function getDirectionsUrl(venue: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue)}`
}
