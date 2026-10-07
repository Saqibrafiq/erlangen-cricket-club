import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { revalidatePagesAfterGlobalChange } from '../hooks/revalidate-pages'

const MAX_LATITUDE = 90
const MAX_LONGITUDE = 180

/** How to reach the club: email, social media and the ground. */
export const contact: GlobalConfig = {
  slug: 'contact',
  label: 'Contact',
  admin: {
    group: 'Club',
    description: 'Shown on the contact page.',
  },
  access: { read: anyone },
  hooks: { afterChange: [revalidatePagesAfterGlobalChange] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', required: true },
        { name: 'facebookUrl', label: 'Facebook page', type: 'text' },
        { name: 'instagramUrl', label: 'Instagram profile', type: 'text' },
      ],
    },
    {
      name: 'ground',
      type: 'group',
      admin: { description: 'Where we train and play home matches.' },
      fields: [
        { name: 'name', type: 'text', required: true, localized: true },
        {
          type: 'row',
          fields: [
            { name: 'street', type: 'text', required: true },
            { name: 'postalCode', type: 'text', required: true },
            { name: 'city', type: 'text', required: true },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'latitude',
              type: 'number',
              required: true,
              min: -MAX_LATITUDE,
              max: MAX_LATITUDE,
              admin: {
                description: 'e.g. 49.59391 — right-click the pitch in Google Maps to copy it.',
              },
            },
            {
              name: 'longitude',
              type: 'number',
              required: true,
              min: -MAX_LONGITUDE,
              max: MAX_LONGITUDE,
              admin: { description: 'e.g. 10.97719' },
            },
          ],
        },
        {
          name: 'directions',
          type: 'textarea',
          localized: true,
          admin: { description: 'How to get there by train, bus or on foot.' },
        },
      ],
    },
  ],
}
