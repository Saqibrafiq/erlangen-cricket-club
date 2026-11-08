import type { CollectionConfig } from 'payload'

import { admins } from '../access/roles'

/**
 * Every notification the app has sent, under a deterministic key (kind, subject, recipient, day),
 * so a scheduled job that runs twice sends nothing twice (ADR-0004 in the app).
 */
export const notificationLog: CollectionConfig = {
  slug: 'notification-log',
  labels: { singular: 'Sent notification', plural: 'Sent notifications' },
  admin: {
    group: 'Members’ app',
    defaultColumns: ['kind', 'user', 'createdAt'],
    useAsTitle: 'key',
  },
  access: {
    read: admins,
    create: admins,
    update: () => false,
    delete: admins,
  },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'kind', type: 'text', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
  ],
}
