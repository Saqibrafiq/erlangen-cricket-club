import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/routing'

import { sortSponsors } from '../domain/sponsors'
import type { Sponsor } from '../types'
import { mapSponsor } from './map-sponsor'

// Populates logo and announcement.
const WITH_RELATIONS = 1

/** Active sponsors in `locale` (falling back to English): title sponsors first. */
export async function getSponsors(locale: Locale): Promise<Sponsor[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'sponsors',
    where: { isActive: { equals: true } },
    locale,
    depth: WITH_RELATIONS,
    pagination: false,
  })

  return sortSponsors(docs.map(mapSponsor))
}
