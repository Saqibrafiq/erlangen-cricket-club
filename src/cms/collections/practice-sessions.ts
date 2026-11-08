import type { CollectionConfig } from 'payload'

import { adminsOrOwnTeam } from '../access/members-app'
import { adminField, admins, members } from '../access/roles'
import { validateTime } from '../fields/validate-time'

/**
 * Team practices for the members' app (ADR-0024). The app creates one per team for each weekend
 * match (Saturday → Wednesday, Sunday → Thursday); the admin adds others by hand (Q-1).
 */
export const practiceSessions: CollectionConfig = {
  slug: 'practice-sessions',
  labels: { singular: 'Practice', plural: 'Practices' },
  admin: {
    group: 'Members’ app',
    defaultColumns: ['date', 'team', 'startTime', 'isCancelled', 'isRecorded'],
    useAsTitle: 'date',
  },
  access: {
    read: members,
    create: admins,
    // The captain closes the check-in (isRecorded); everything else is the Board's.
    update: adminsOrOwnTeam,
    delete: admins,
  },
  indexes: [{ fields: ['team', 'date'], unique: true }],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'team',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          filterOptions: { isClubTeam: { equals: true } },
          access: { update: adminField },
          admin: { width: '34%' },
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          access: { update: adminField },
          admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'startTime',
          type: 'text',
          required: true,
          defaultValue: '18:30',
          validate: validateTime,
          access: { update: adminField },
          admin: { width: '33%', description: 'HH:mm, club time.' },
        },
      ],
    },
    {
      name: 'fixture',
      type: 'relationship',
      relationTo: 'fixtures',
      access: { update: adminField },
      admin: { description: 'The match this practice prepares for; empty for an extra practice.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isCancelled',
          label: 'Cancelled',
          type: 'checkbox',
          defaultValue: false,
          access: { update: adminField },
          admin: { description: 'Cancelled practices never count for attendance (Q-2).' },
        },
        {
          name: 'isRecorded',
          label: 'Attendance recorded',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Set when the captain completes the check-in.' },
        },
        {
          name: 'isManual',
          label: 'Added by hand',
          type: 'checkbox',
          defaultValue: false,
          access: { update: adminField },
        },
      ],
    },
  ],
}
