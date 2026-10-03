import type { CollectionConfig, FieldHook } from 'payload'

import type { Competition } from '../../payload-types'
import { slugify } from '../../shared/lib/slugify'
import { anyone } from '../access/anyone'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'

const DEFAULT_MAX_OVERS = 20

/** Generates the URL slug from name and season when an editor leaves it empty. */
const generateSlug: FieldHook<Competition, string | null | undefined> = ({ value, data }) =>
  value ? slugify(value) : slugify(`${data?.name ?? ''} ${data?.season ?? ''}`)

export const competitions: CollectionConfig = {
  slug: 'competitions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'season', 'slug', 'maxOvers'],
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
      admin: { description: 'e.g. "BCV T20 Regionalliga Bayern".' },
    },
    {
      name: 'season',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'e.g. "2026".' },
    },
    {
      name: 'maxOvers',
      type: 'number',
      required: true,
      min: 1,
      defaultValue: DEFAULT_MAX_OVERS,
      admin: { description: 'Scheduled overs per innings (20 for T20).' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: {
        position: 'sidebar',
        description:
          'URL segment, e.g. "bcv-t20-regionalliga-bayern-2026". Generated if left empty.',
      },
    },
  ],
}
