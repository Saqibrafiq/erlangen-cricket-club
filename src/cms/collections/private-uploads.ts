import type { CollectionConfig } from 'payload'

import { adminsOrOwnTeam, createForOwnTeam } from '../access/members-app'
import { adminField, admins } from '../access/roles'
import { setEventTeam } from '../hooks/set-event-team'

/** Photos only, scaled to a readable size and stored as JPEG to keep the database small. */
const PHOTO_UPLOAD = {
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  resizeOptions: { width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true },
  formatOptions: { format: 'jpeg', options: { quality: 82 } },
} as const satisfies CollectionConfig['upload']

/**
 * The image of a player's Spielerpass card (ADR-0025): personal data, kept in the database, the
 * Board only. The app shows a captain the cards of an approved squad through its server.
 */
export const spielerpassCards: CollectionConfig = {
  slug: 'spielerpass-cards',
  labels: { singular: 'Spielerpass card', plural: 'Spielerpass cards' },
  admin: { group: 'Members’ app' },
  access: { read: admins, create: admins, update: admins, delete: admins },
  upload: PHOTO_UPLOAD,
  fields: [],
}

/**
 * A photo of the signed DCB match report sheet, uploaded by the captain after the match (UC-22,
 * ADR-0007 in the app): only admins and that team's captain see it.
 */
export const matchSheets: CollectionConfig = {
  slug: 'match-sheets',
  labels: { singular: 'Signed match sheet', plural: 'Signed match sheets' },
  admin: { group: 'Members’ app', defaultColumns: ['fixture', 'team', 'updatedAt'] },
  access: {
    read: adminsOrOwnTeam,
    create: createForOwnTeam,
    update: adminsOrOwnTeam,
    delete: admins,
  },
  upload: PHOTO_UPLOAD,
  hooks: { beforeChange: [setEventTeam] },
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
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
