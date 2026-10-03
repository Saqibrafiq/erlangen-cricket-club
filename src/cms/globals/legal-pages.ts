import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { revalidatePagesAfterGlobalChange } from '../hooks/revalidate-pages'

function legalPage(slug: string, label: string, description: string): GlobalConfig {
  return {
    slug,
    label,
    admin: { group: 'Legal', description },
    access: { read: anyone },
    hooks: { afterChange: [revalidatePagesAfterGlobalChange] },
    fields: [
      {
        name: 'content',
        type: 'richText',
        localized: true,
      },
    ],
  }
}

/** Provider identification required by § 5 DDG. Must be complete before the site goes live. */
export const impressum = legalPage(
  'impressum',
  'Impressum',
  'Legal notice (§ 5 DDG): association name, address, board, register court and number, contact.',
)

/** Privacy policy required by the GDPR. Must be complete before the site goes live. */
export const privacyPolicy = legalPage(
  'privacy-policy',
  'Datenschutzerklärung',
  'Privacy policy (GDPR): controller, data processed, hosting, rights of data subjects.',
)
