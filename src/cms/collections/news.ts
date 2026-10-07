import type { CollectionConfig, FieldHook } from 'payload'

import type { News } from '../../payload-types'
import { slugify } from '../../shared/lib/slugify'
import { publishedOrSignedIn } from '../access/published-or-signed-in'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'

// Long enough for a teaser, short enough for search-result snippets and cards.
const EXCERPT_MAX_LENGTH = 300

/** Generates the URL slug from the title when an editor leaves it empty. */
const generateSlug: FieldHook<News, string | null | undefined> = ({ value, data }) =>
  slugify(value ?? data?.title ?? '')

export const news: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'News article', plural: 'News' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', '_status'],
  },
  access: {
    read: publishedOrSignedIn,
  },
  versions: { drafts: true },
  defaultSort: '-publishedAt',
  hooks: {
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: EXCERPT_MAX_LENGTH,
      admin: {
        description: 'One or two sentences for news cards, search results and link previews.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'featuredImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            width: '70%',
            description:
              'Shown after the heading and in link previews, e.g. a sponsor logo or the best photo.',
          },
        },
        {
          name: 'featuredImageStyle',
          type: 'select',
          required: true,
          defaultValue: 'photo',
          options: [
            { label: 'Photo (fills the frame)', value: 'photo' },
            { label: 'Logo (shown whole on a light panel)', value: 'logo' },
          ],
          admin: { width: '30%' },
        },
      ],
    },
    { name: 'body', type: 'richText', required: true, localized: true },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'More photos, shown as a gallery below the article.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
      },
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
        description: 'URL segment, generated from the title if left empty.',
      },
    },
  ],
}
