import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { admins } from '../access/roles'

/** Downloadable files for visitors, e.g. the membership application form. */
export const documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    group: 'Club',
  },
  access: {
    read: anyone,
    // Website content: only the Board edits it (ADR-0024).
    create: admins,
    update: admins,
    delete: admins,
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
