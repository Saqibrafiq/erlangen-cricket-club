import type { Payload } from 'payload'

import { slugify } from '../../shared/lib/slugify'
import { SEED_PLAYERS } from './data/players'
import { SEED_CONTEXT, upsertImage } from './media'
import type { SeedPlayer } from './types'

const PLAYER_ASSETS = 'players'
const BOARD_CONSENT_NOTE =
  'Confirmed by the club board on 9 October 2026 (listed on the old website).'

async function createPlayerIfMissing(payload: Payload, player: SeedPlayer): Promise<boolean> {
  const existing = await payload.count({
    collection: 'players',
    where: { name: { equals: player.name } },
  })
  if (existing.totalDocs > 0) {
    return false
  }

  await payload.create({
    collection: 'players',
    context: SEED_CONTEXT,
    data: {
      name: player.name,
      slug: slugify(player.name),
      photo: player.photo ? await upsertImage(payload, PLAYER_ASSETS, player.photo) : null,
      hasPublishConsent: true,
      consentNote: player.consentNote ?? BOARD_CONSENT_NOTE,
    },
  })

  return true
}

/** Imports the squad (mostly from the old website); existing players (matched by name) stay as edited. */
export async function seedPlayers(payload: Payload): Promise<void> {
  let created = 0
  for (const player of SEED_PLAYERS) {
    if (await createPlayerIfMissing(payload, player)) {
      created += 1
    }
  }

  payload.logger.info(
    `Players: ${created} created, ${SEED_PLAYERS.length - created} already present.`,
  )
}
