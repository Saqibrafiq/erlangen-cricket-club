import type { CollectionConfig } from 'payload'

import { adminsOrOwnPlayer, createForOwnPlayer, reasonReaders } from '../access/members-app'
import { adminField, admins, members } from '../access/roles'
import { REASON_MAX_LENGTH, validateOneEvent, validateReason } from '../fields/validate-event'
import { setEventTeam } from '../hooks/set-event-team'

/**
 * A member's Going / Not going for a match or a practice (ADR-0024). Who is going is open to all
 * members (motion 2026/06); the reason for not going only to the member, their captain and admins.
 */
export const availabilityResponses: CollectionConfig = {
  slug: 'availability-responses',
  labels: { singular: 'Availability answer', plural: 'Availability answers' },
  admin: {
    group: 'Members’ app',
    defaultColumns: ['player', 'fixture', 'practice', 'response', 'updatedAt'],
  },
  access: {
    read: members,
    create: createForOwnPlayer,
    update: adminsOrOwnPlayer,
    delete: admins,
  },
  hooks: {
    beforeChange: [setEventTeam],
  },
  indexes: [
    { fields: ['player', 'fixture'], unique: true },
    { fields: ['player', 'practice'], unique: true },
  ],
  fields: [
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      required: true,
      access: { update: adminField },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'fixture',
          type: 'relationship',
          relationTo: 'fixtures',
          validate: validateOneEvent,
          access: { update: adminField },
          admin: { width: '50%' },
        },
        {
          name: 'practice',
          type: 'relationship',
          relationTo: 'practice-sessions',
          validate: validateOneEvent,
          access: { update: adminField },
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'response',
      type: 'select',
      required: true,
      options: [
        { label: 'Going', value: 'going' },
        { label: 'Not going', value: 'not-going' },
      ],
    },
    {
      name: 'reason',
      type: 'text',
      maxLength: REASON_MAX_LENGTH,
      validate: validateReason,
      access: { read: reasonReaders },
      admin: { condition: (_data, siblingData) => siblingData.response === 'not-going' },
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      // Derived from the event by the hook; read by the access rules.
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
