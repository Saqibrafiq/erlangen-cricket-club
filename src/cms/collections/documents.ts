import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'

/** Downloadable files for visitors, e.g. the membership application form. */
export const documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    group: 'Club',
  },
  access: {
    read: anyone,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Shown as the download link text, e.g. "Membership application form".',
      },
    },
  ],
  upload: {
    mimeTypes: ['application/pdf'],
  },
}
