import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'

export const teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'shortName', 'isClubTeam'],
  },
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Full team name, e.g. "Erlangen Cricket Club I".' },
    },
    {
      name: 'shortName',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Code used by the league, e.g. "ECC-I".' },
    },
    {
      name: 'isClubTeam',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Tick for Erlangen Cricket Club teams; results are shown from their perspective.',
      },
    },
  ],
}
