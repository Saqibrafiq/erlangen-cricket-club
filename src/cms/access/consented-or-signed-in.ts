import type { Access } from 'payload'

/**
 * Visitors see only people who agreed to appear on the website (GDPR, see ADR-0009); signed-in
 * editors see everyone.
 */
export const consentedOrSignedIn: Access = ({ req }) =>
  req.user ? true : { hasPublishConsent: { equals: true } }
