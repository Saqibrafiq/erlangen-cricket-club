import config from '@payload-config'
import { getPayload } from 'payload'

import type { Locale } from '@/i18n/routing'

import type { ContactInfo } from '../types'
import { mapContact } from './map-contact'

/** Email, social links, postal address and the ground in `locale`, falling back to English. */
export async function getContactInfo(locale: Locale): Promise<ContactInfo> {
  const payload = await getPayload({ config })
  const global = await payload.findGlobal({ slug: 'contact', locale, depth: 0 })

  return mapContact(global)
}
