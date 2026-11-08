import type { Access } from 'payload'

/**
 * Visitors see only people who agreed to appear on the website (GDPR, see ADR-0009). Signed-in
 * members see everyone: the members' app lists every player of a squad (ADR-0024).
 */
export const consentedOrSignedIn: Access = ({ req }) =>
  req.user ? true : { hasPublishConsent: { equals: true } }
