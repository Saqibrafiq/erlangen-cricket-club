import type { CollectionConfig } from 'payload'

import { adminsOrOwnTeam, adminsOwnTeamOrOwnPlayer, createForOwnTeam } from '../access/members-app'
import { setEventTeam } from '../hooks/set-event-team'

/**
 * Practice attendance, marked by the captain (or an admin) at the check-in (ADR-0024). Anyone not
 * marked present at a recorded practice missed it; walk-ins are added by hand.
 */
export const attendance: CollectionConfig = {
  slug: 'attendance',
  labels: { singular: 'Attendance', plural: 'Attendance' },
  admin: {
    group: 'Members’ app',
    defaultColumns: ['practice', 'player', 'attended', 'isWalkIn'],
  },
  access: {
    read: adminsOwnTeamOrOwnPlayer,
    create: createForOwnTeam,
    update: adminsOrOwnTeam,
    delete: adminsOrOwnTeam,
  },
  hooks: {
    beforeChange: [setEventTeam],
  },
  indexes: [{ fields: ['practice', 'player'], unique: true }],
  fields: [
    {
      name: 'practice',
      type: 'relationship',
      relationTo: 'practice-sessions',
      required: true,
    },
    { name: 'player', type: 'relationship', relationTo: 'players', required: true },
    {
      type: 'row',
      fields: [
        { name: 'attended', type: 'checkbox', defaultValue: true },
        {
          name: 'isWalkIn',
          label: 'Walk-in',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Came without having answered Going.' },
        },
      ],
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
