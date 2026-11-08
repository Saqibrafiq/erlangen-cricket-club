import type { CollectionConfig, Field } from 'payload'

import { adminsOrOwnTeam, approvedOrOwnTeam } from '../access/members-app'
import { adminField, admins } from '../access/roles'
import { guardSquadChanges } from '../hooks/guard-squad-changes'
import { setEventTeam } from '../hooks/set-event-team'

const playerList = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: 'relationship',
  relationTo: 'players',
  hasMany: true,
  admin: { description },
})

/**
 * One match's selection, from open availability to the announced squad (ADR-0024): the captain
 * picks the XI, the 12th man and any reserves; the Board approves and announces it by Thursday.
 */
export const squads: CollectionConfig = {
  slug: 'squads',
  labels: { singular: 'Match squad', plural: 'Match squads' },
  admin: {
    group: 'Members’ app',
    defaultColumns: ['fixture', 'team', 'status', 'deadlineDay'],
  },
  access: {
    read: approvedOrOwnTeam,
    create: admins,
    update: adminsOrOwnTeam,
    delete: admins,
  },
  hooks: {
    beforeChange: [guardSquadChanges, setEventTeam],
  },
  fields: [
    {
      name: 'fixture',
      type: 'relationship',
      relationTo: 'fixtures',
      required: true,
      unique: true,
      access: { update: adminField },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'open',
          options: [
            { label: 'Open for answers', value: 'open' },
            { label: 'Submitted by the captain', value: 'submitted' },
            { label: 'Approved and announced', value: 'approved' },
            { label: 'Returned to the captain', value: 'returned' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'deadlineDay',
          label: 'Availability closes',
          type: 'select',
          required: true,
          defaultValue: 'tuesday',
          options: [
            { label: 'End of Tuesday', value: 'tuesday' },
            { label: 'End of Wednesday', value: 'wednesday' },
            { label: 'End of Thursday', value: 'thursday' },
          ],
          access: { update: adminField },
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'picks',
      type: 'array',
      admin: { description: 'The squad: exactly 11 playing and one 12th man; reserves optional.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'player',
              type: 'relationship',
              relationTo: 'players',
              required: true,
              admin: { width: '40%' },
            },
            {
              name: 'role',
              type: 'select',
              required: true,
              defaultValue: 'playing',
              options: [
                { label: 'Playing XI', value: 'playing' },
                { label: '12th man', value: 'twelfth' },
                { label: 'Reserve', value: 'reserve' },
              ],
              admin: { width: '30%' },
            },
            {
              name: 'isBorrowed',
              label: 'From the other squad',
              type: 'checkbox',
              defaultValue: false,
              admin: { width: '30%' },
            },
          ],
        },
      ],
    },
    {
      ...playerList(
        'exceptions',
        'Exceptions',
        'Players the Board makes selectable for this match despite the rules (R-8).',
      ),
      access: { update: adminField },
    } as Field,
    playerList(
      'noShows',
      'No-shows',
      'Selected players who did not appear: they sit out the next match (motion 2023/10).',
    ),
    {
      name: 'note',
      type: 'textarea',
      maxLength: 500,
      access: { update: adminField },
      admin: { description: 'Why the Board returned the squad to the captain.' },
    },
    {
      name: 'approvedAt',
      type: 'date',
      access: { update: adminField },
      admin: { readOnly: true, position: 'sidebar' },
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
