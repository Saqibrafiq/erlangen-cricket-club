import type { GlobalConfig } from 'payload'

import { signedIn } from '../access/signed-in'
import { revalidatePagesAfterGlobalChange } from '../hooks/revalidate-pages'

/**
 * Access to the club's Instagram posts for the home page (ADR-0011). Editors only: the token is a
 * secret. The site renews it automatically, so it never reaches Instagram's 60-day expiry.
 */
export const instagram: GlobalConfig = {
  slug: 'instagram',
  label: 'Instagram feed',
  admin: {
    group: 'Club',
    description:
      'Shows the latest Instagram posts on the home page. Needs a Professional (Business or Creator) Instagram account.',
  },
  access: { read: signedIn, update: signedIn },
  hooks: { afterChange: [revalidatePagesAfterGlobalChange] },
  fields: [
    {
      name: 'accessToken',
      label: 'Access token',
      type: 'text',
      admin: {
        description:
          'Long-lived token from Meta for Developers (Instagram API with Instagram Login, permission instagram_business_basic). Leave empty to hide the posts.',
      },
    },
    {
      name: 'tokenRefreshedAt',
      label: 'Token last renewed',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Set by the website when it renews the token (about weekly).',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
