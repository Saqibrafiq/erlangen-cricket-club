import type { CollectionConfig, Field, FieldHook } from 'payload'

import type { Competition } from '../../payload-types'
import { slugify } from '../../shared/lib/slugify'
import { anyone } from '../access/anyone'
import { validateOvers } from '../fields/validate-overs'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'

const DEFAULT_MAX_OVERS = 20

function countField(name: string, label: string): Field {
  return { name, label, type: 'number', required: true, min: 0 }
}

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
      name: 'isFeatured',
      label: 'Show next match on the home page',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'The home page counts down to the next match of the ticked competitions only.',
      },
    },
    {
      name: 'standings',
      type: 'array',
      labels: { singular: 'Row', plural: 'Rows' },
      admin: {
        initCollapsed: true,
        description:
          'The league table exactly as published on CricClubs, one row per team in published order (row 1 = position 1).',
      },
      fields: [
        { name: 'team', type: 'relationship', relationTo: 'teams', required: true },
        {
          type: 'row',
          fields: [
            countField('played', 'MAT'),
            countField('won', 'WON'),
            countField('lost', 'LOST'),
            countField('noResult', 'N/R'),
            countField('tied', 'TIE'),
            countField('points', 'PTS'),
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'winRate',
              label: 'WIN %',
              type: 'number',
              required: true,
              min: 0,
              max: 100,
              admin: { description: 'As published, e.g. 71.43.' },
            },
            {
              name: 'netRunRate',
              label: 'NET RR',
              type: 'number',
              required: true,
              admin: { description: 'As published, e.g. 1.1694 or -0.2636.' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            countField('runsFor', 'FOR — runs'),
            {
              name: 'oversFaced',
              label: 'FOR — overs',
              type: 'text',
              required: true,
              validate: validateOvers,
            },
            countField('runsAgainst', 'AGAINST — runs'),
            {
              name: 'oversBowled',
              label: 'AGAINST — overs',
              type: 'text',
              required: true,
              validate: validateOvers,
            },
          ],
        },
      ],
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
