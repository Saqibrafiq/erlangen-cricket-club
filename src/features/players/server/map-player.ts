import type { Media, Player as PlayerDoc, Team } from '@/payload-types'

import type { PlayerDraft } from '../editor-types'
import type { Player, PlayerPhoto, PlayerTeam } from '../types'

function mapPhoto(media: number | Media | null | undefined): PlayerPhoto | null {
  if (typeof media !== 'object' || !media?.url || !media.width || !media.height) {
    return null
  }

  return { url: media.url, alt: media.alt, width: media.width, height: media.height }
}

function mapTeams(teams: (number | Team)[] | null | undefined): PlayerTeam[] {
  return (teams ?? [])
    .filter((team): team is Team => typeof team === 'object')
    .map((team) => ({ id: team.id, name: team.name }))
}

/** Maps a player (queried with depth >= 1) to the view model. */
export function mapPlayer(doc: PlayerDoc): Player {
  return {
    id: doc.id,
    slug: doc.slug,
    name: doc.name,
    photo: mapPhoto(doc.photo),
    playingRole: doc.playingRole ?? null,
    battingStyle: doc.battingStyle ?? null,
    bowlingStyle: doc.bowlingStyle ?? null,
    teams: mapTeams(doc.teams),
    clubOffice: doc.clubOffice ?? null,
    bio: doc.bio ?? null,
    isFeaturedOnHome: doc.isFeaturedOnHome ?? false,
  }
}

/** Maps a player (queried with depth >= 1, as an editor) to what the edit form needs. */
export function mapPlayerDraft(doc: PlayerDoc): PlayerDraft {
  return {
    id: doc.id,
    name: doc.name,
    photo: mapPhoto(doc.photo),
    playingRole: doc.playingRole ?? null,
    battingStyle: doc.battingStyle ?? null,
    bowlingStyle: doc.bowlingStyle ?? null,
    clubOffice: doc.clubOffice ?? null,
    teams: mapTeams(doc.teams).map((team) => team.id),
    bio: doc.bio ?? null,
    isFeaturedOnHome: doc.isFeaturedOnHome ?? false,
    hasPublishConsent: doc.hasPublishConsent ?? false,
    consentNote: doc.consentNote ?? null,
  }
}
