import type { CollectionConfig } from 'payload'

export const users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email'],
  },
  auth: {
    // The session cookie only travels over HTTPS in production (localhost counts as secure too).
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: { description: 'Shown in the account menu on the website, e.g. "Saqib Rafiq".' },
    },
  ],
}
