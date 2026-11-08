import type { Access } from 'payload'

import { isAdmin } from './roles'

/** Everyone sees published documents only; admins also see drafts. */
export const publishedOrAdmin: Access = ({ req }) =>
  isAdmin(req.user) ? true : { _status: { equals: 'published' } }
