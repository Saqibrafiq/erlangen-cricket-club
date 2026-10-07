import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/routing'

import type { JourneyInfo } from '../types'
import { mapJourney } from './map-journey'

// Populates the story image and the milestone images.
const WITH_IMAGES = 1

/** The club's story and milestones in `locale`, falling back to English. */
export async function getJourney(locale: Locale): Promise<JourneyInfo> {
  const payload = await getPayload({ config })
  const global = await payload.findGlobal({ slug: 'journey', locale, depth: WITH_IMAGES })

  return mapJourney(global)
}
