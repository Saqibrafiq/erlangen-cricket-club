import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { admins } from '../access/roles'

export const media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    // Website content: only the Board edits it (ADR-0024).
    create: admins,
    update: admins,
    delete: admins,
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
