import type { Access, CollectionConfig } from 'payload'

import { isAdmin, relationId } from '../access/roles'

/** A member's own devices only; admins (the app's service account) all of them. */
const adminsOrOwnDevices: Access = ({ req }) => {
  if (!req.user) return false
  return isAdmin(req.user) ? true : { user: { equals: req.user.id } }
}

const registerOwnDevice: Access = ({ req, data }) =>
  Boolean(req.user) &&
  (isAdmin(req.user) || relationId((data as { user?: unknown } | undefined)?.user) === req.user?.id)

/**
 * A device's Web Push subscription, registered when the member allows notifications (ADR-0003 in
 * the app). Removed when the push service reports it expired.
 */
export const pushSubscriptions: CollectionConfig = {
  slug: 'push-subscriptions',
  labels: { singular: 'Push subscription', plural: 'Push subscriptions' },
  admin: { group: 'Members’ app', defaultColumns: ['user', 'userAgent', 'createdAt'] },
  access: {
    read: adminsOrOwnDevices,
    create: registerOwnDevice,
    update: adminsOrOwnDevices,
    delete: adminsOrOwnDevices,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'endpoint', type: 'text', required: true, unique: true },
    {
      type: 'row',
      fields: [
        { name: 'p256dh', type: 'text', required: true },
        { name: 'auth', type: 'text', required: true },
      ],
    },
    { name: 'userAgent', label: 'Device', type: 'text' },
  ],
}
