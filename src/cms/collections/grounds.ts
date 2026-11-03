import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'

/**
 * Where matches are played. Saved once and picked per fixture, so a ground is spelled the same
 * everywhere; the fixtures import adds grounds it doesn't know yet.
 */
export const grounds: CollectionConfig = {
  slug: 'grounds',
  admin: {
    useAsTitle: 'name',
    group: 'Matches',
    defaultColumns: ['name', 'address'],
    description: 'Cricket grounds. Fixtures show the name; the address powers "Directions".',
  },
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  defaultSort: 'name',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'As players know it, e.g. "Erlangen Cricket Ground".' },
    },
    {
      name: 'address',
      type: 'text',
      admin: {
        description: 'Street, postcode and town, e.g. "Siedlerstraße 1, 91056 Erlangen".',
      },
    },
  ],
}
