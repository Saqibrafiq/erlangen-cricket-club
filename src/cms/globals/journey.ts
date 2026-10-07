import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { validateLink } from '../fields/validate-link'
import { revalidatePagesAfterGlobalChange } from '../hooks/revalidate-pages'

const FIRST_SEASON = 2000
const LAST_SEASON = 2100

/** The club's story and its milestones, as shown on the journey page. */
export const journey: GlobalConfig = {
  slug: 'journey',
  label: 'Journey',
  admin: {
    group: 'Club',
    description: 'The club’s story and timeline, shown on the “Our journey” page.',
  },
  access: { read: anyone },
  hooks: { afterChange: [revalidatePagesAfterGlobalChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Story',
          fields: [
            {
              name: 'chapters',
              type: 'array',
              labels: { singular: 'Chapter', plural: 'Chapters' },
              maxRows: 3,
              admin: {
                description: 'Up to three short chapters, shown side by side as cards.',
              },
              fields: [
                { name: 'title', type: 'text', required: true, localized: true },
                { name: 'text', type: 'textarea', required: true, localized: true },
              ],
            },
          ],
        },
        {
          label: 'Milestones',
          fields: [
            {
              name: 'milestones',
              type: 'array',
              labels: { singular: 'Milestone', plural: 'Milestones' },
              admin: { description: 'Shown oldest first; the order here does not matter.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'year',
                      type: 'number',
                      required: true,
                      min: FIRST_SEASON,
                      max: LAST_SEASON,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: { width: '75%' },
                    },
                  ],
                },
                { name: 'text', type: 'textarea', required: true, localized: true },
                { name: 'image', type: 'upload', relationTo: 'media' },
                {
                  name: 'link',
                  type: 'text',
                  validate: validateLink,
                  admin: {
                    description:
                      'Optional “Read more” link, e.g. "/news/annual-general-meeting-2024-key-takeaways".',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
