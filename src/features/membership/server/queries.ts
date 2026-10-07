import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/routing'

import type { MembershipInfo } from '../types'
import { mapMembership } from './map-membership'

// Populates the hero image and the application form.
const WITH_UPLOADS = 1

/** Fees, weekly sessions and the application form in `locale`, falling back to English. */
export async function getMembershipInfo(locale: Locale): Promise<MembershipInfo> {
  const payload = await getPayload({ config })
  const global = await payload.findGlobal({ slug: 'membership', locale, depth: WITH_UPLOADS })

  return mapMembership(global)
}
