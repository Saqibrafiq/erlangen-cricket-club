import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'

export const media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Describe the image for people who cannot see it (required for accessibility).',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
  },
}
