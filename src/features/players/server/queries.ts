import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/routing'

import type { Player } from '../types'
import { mapPlayer } from './map-player'

// The Local API bypasses access control, so public queries apply the consent rule explicitly.
const CONSENTED: Where = { hasPublishConsent: { equals: true } }
// Populates photo and teams.
const WITH_RELATIONS = 1

/** Players who agreed to appear on the website, by name, in `locale` (falling back to English). */
export async function getPlayers(locale: Locale): Promise<Player[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'players',
    where: CONSENTED,
    sort: 'name',
    locale,
    depth: WITH_RELATIONS,
    pagination: false,
  })

  return docs.map(mapPlayer)
}

/**
 * One player with consent, or `null` if none has this slug.
 * Cached per request: the layout, metadata and page all call it.
 */
export const getPlayer = cache(async function getPlayer(
  slug: string,
  locale: Locale,
): Promise<Player | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'players',
    where: { and: [CONSENTED, { slug: { equals: slug } }] },
    locale,
    depth: WITH_RELATIONS,
    limit: 1,
  })
  const doc = docs[0]

  return doc ? mapPlayer(doc) : null
})

/** Slugs and last edits of all players with consent, for static params and the sitemap. */
export async function getPlayerEntries(): Promise<{ slug: string; updatedAt: string }[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'players',
    where: CONSENTED,
    depth: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
  })

  return docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
}
