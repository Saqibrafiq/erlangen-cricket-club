import type { CollectionConfig, Validate } from 'payload'

import { anyone } from '../access/anyone'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'

const FIRST_SEASON = 2000
const LAST_SEASON = 2100

const validateWebsite: Validate<string | null | undefined> = (value) =>
  !value || value.startsWith('https://') || 'Use a full address starting with https://.'

/** Companies and people who support the club, shown on the sponsors page. */
export const sponsors: CollectionConfig = {
  slug: 'sponsors',
  admin: {
    useAsTitle: 'name',
    group: 'Club',
    defaultColumns: ['name', 'tier', 'since', 'isActive'],
    description:
      'Shown on the sponsors page: title sponsors first, then by how long they support us.',
  },
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  defaultSort: 'since',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Shown whole on a white panel; transparent PNG or SVG works best.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tier',
          type: 'select',
          required: true,
          defaultValue: 'sponsor',
          options: [
            { label: 'Title sponsor', value: 'title' },
            { label: 'Sponsor', value: 'sponsor' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'since',
          label: 'Sponsor since (year)',
          type: 'number',
          required: true,
          min: FIRST_SEASON,
          max: LAST_SEASON,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'One or two sentences about the sponsor.' },
    },
    { name: 'website', type: 'text', validate: validateWebsite },
    {
      name: 'announcement',
      type: 'relationship',
      relationTo: 'news',
      admin: { description: 'News article announcing the sponsorship, if any.' },
    },
    {
      name: 'isActive',
      label: 'Show on the website',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Untick when the sponsorship ends.' },
    },
  ],
}
