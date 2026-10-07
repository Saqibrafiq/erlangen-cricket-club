import type { CollectionConfig } from 'payload'

import { signedIn } from '../access/signed-in'

// Kept short on purpose (data minimisation): enough for the board to reply, nothing more.
const MESSAGE_MAX_LENGTH = 1000

/**
 * Messages from the contact page. Personal data: only signed-in editors can read them, and nobody
 * can create them through the API — the website's server action writes them after validation and
 * spam checks.
 */
export const contactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: 'Contact message', plural: 'Contact messages' },
  admin: {
    useAsTitle: 'name',
    group: 'Club',
    defaultColumns: ['name', 'topic', 'email', 'status', 'createdAt'],
    description: 'Sent from the contact page. Reply by email, then update the status.',
  },
  access: {
    create: () => false,
    read: signedIn,
    update: signedIn,
    delete: signedIn,
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    {
      name: 'topic',
      type: 'select',
      required: true,
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Sponsorship', value: 'sponsorship' },
        { label: 'Matches and fixtures', value: 'matches' },
        { label: 'Something else', value: 'other' },
      ],
    },
    { name: 'message', type: 'textarea', required: true, maxLength: MESSAGE_MAX_LENGTH },
    {
      name: 'locale',
      type: 'select',
      required: true,
      options: [
        { label: 'English', value: 'en' },
        { label: 'Deutsch', value: 'de' },
      ],
      admin: { position: 'sidebar', description: 'Language of the website when it was sent.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Replied', value: 'replied' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
