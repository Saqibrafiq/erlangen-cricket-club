import type { Access } from 'payload'

/** Visitors see published documents only; signed-in editors also see drafts. */
export const publishedOrSignedIn: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
