import type { Payload } from 'payload'

import { SEED_CONTEXT } from './media'

/**
 * Creates the admin account the end-to-end tests sign in with — only when both variables are set,
 * which CI does for its throwaway database. Production seeds never set them, so no account with a
 * known password can end up there.
 */
export async function seedE2eUser(payload: Payload): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL
  const password = process.env.E2E_ADMIN_PASSWORD
  if (!email || !password) {
    return
  }

  const existing = await payload.count({ collection: 'users', where: { email: { equals: email } } })
  if (existing.totalDocs > 0) {
    payload.logger.info('E2E admin: already present.')
    return
  }

  await payload.create({ collection: 'users', data: { email, password }, context: SEED_CONTEXT })
  payload.logger.info('E2E admin: created.')
}
