import type { Access } from 'payload'

/** Only signed-in editors, e.g. for personal data submitted through public forms. */
export const signedIn: Access = ({ req }) => Boolean(req.user)
