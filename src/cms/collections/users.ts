import type { CollectionConfig } from 'payload'

export const users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // The session cookie only travels over HTTPS in production (localhost counts as secure too).
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
  },
  fields: [],
}
