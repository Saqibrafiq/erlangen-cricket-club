import type { Field, GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { validateTime } from '../fields/validate-time'
import { revalidatePagesAfterGlobalChange } from '../hooks/revalidate-pages'

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

function localizedText(name: string, description: string): Field {
  return { name, type: 'text', required: true, localized: true, admin: { description } }
}

function localizedTextarea(name: string, description: string): Field {
  return { name, type: 'textarea', localized: true, admin: { description } }
}

function timeField(name: string, label: string): Field {
  return {
    name,
    label,
    type: 'text',
    required: true,
    validate: validateTime,
    admin: { description: 'HH:mm, e.g. 17:30.', width: '50%' },
  }
}

/** Everything the membership page shows: fees, training and match days, the application form. */
export const membership: GlobalConfig = {
  slug: 'membership',
  label: 'Membership',
  admin: {
    group: 'Club',
    description: 'Fees, training times and the application form, as shown on the membership page.',
  },
  access: { read: anyone },
  hooks: { afterChange: [revalidatePagesAfterGlobalChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Fees',
          fields: [
            {
              name: 'fees',
              type: 'array',
              labels: { singular: 'Membership type', plural: 'Membership types' },
              admin: { description: 'Shown side by side, in this order.' },
              fields: [
                localizedText('name', 'e.g. "Active".'),
                {
                  name: 'includes',
                  type: 'textarea',
                  required: true,
                  localized: true,
                  admin: { description: 'One item per line, shown as a checklist.' },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'annualFee',
                      label: 'Annual fee (€)',
                      type: 'number',
                      required: true,
                      min: 0,
                    },
                    {
                      name: 'reducedFee',
                      label: 'Youth (up to 18) and students (€)',
                      type: 'number',
                      min: 0,
                      admin: { description: 'Leave empty if there is no reduction.' },
                    },
                    {
                      name: 'perMatchFee',
                      label: 'Per tournament match (€)',
                      type: 'number',
                      min: 0,
                      admin: { description: 'Leave empty if none.' },
                    },
                  ],
                },
                {
                  name: 'isHighlighted',
                  label: 'Highlight this membership',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { description: 'Marks it as the way to play league cricket.' },
                },
              ],
            },
            localizedTextarea('feesNote', 'Shown below the fees, e.g. reductions on request.'),
            localizedTextarea('terms', 'Cancellation and payment terms (small print).'),
            {
              name: 'applicationForm',
              type: 'upload',
              relationTo: 'documents',
              admin: { description: 'PDF offered for download on the membership page.' },
            },
          ],
        },
        {
          label: 'Training and match days',
          fields: [
            {
              name: 'sessions',
              type: 'array',
              labels: { singular: 'Session', plural: 'Sessions' },
              fields: [
                localizedText('title', 'e.g. "Training" or "Match days".'),
                {
                  name: 'days',
                  type: 'select',
                  hasMany: true,
                  required: true,
                  options: WEEKDAYS.map((day) => ({
                    label: day.charAt(0).toUpperCase() + day.slice(1),
                    value: day,
                  })),
                },
                {
                  type: 'row',
                  fields: [timeField('startTime', 'From'), timeField('endTime', 'To')],
                },
                localizedText('venue', 'e.g. "Erlangen Cricket Ground".'),
              ],
            },
            localizedTextarea(
              'sessionsNote',
              'e.g. where changes and cancellations are announced.',
            ),
          ],
        },
        {
          label: 'Page',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Large photo at the top of the page, e.g. the squad.' },
            },
          ],
        },
      ],
    },
  ],
}
