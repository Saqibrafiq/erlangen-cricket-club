import type { CollectionConfig } from 'payload'

import { admins } from '../access/roles'

/**
 * A player's Spielerpass details for the DCB match report sheet (ADR-0007 in the app, ADR-0024):
 * the name exactly as registered and the pass number. Personal data, so the Board only; the app
 * shows a captain the passes of an approved squad through its server. The card image follows
 * with its own decision on private storage.
 */
export const spielerpasses: CollectionConfig = {
  slug: 'spielerpasses',
  labels: { singular: 'Spielerpass', plural: 'Spielerpasses' },
  admin: {
    group: 'Members’ app',
    useAsTitle: 'registeredName',
    defaultColumns: ['registeredName', 'passNumber', 'player', 'validUntil'],
  },
  access: {
    read: admins,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    { name: 'player', type: 'relationship', relationTo: 'players', required: true, unique: true },
    {
      type: 'row',
      fields: [
        {
          name: 'registeredName',
          label: 'Name as registered',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'First and second name exactly as on the pass.' },
        },
        {
          name: 'passNumber',
          label: 'Pass Nr.',
          type: 'text',
          required: true,
          admin: { width: '25%' },
        },
        {
          name: 'validUntil',
          type: 'date',
          admin: { width: '25%', date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
  ],
}
