import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

/**
 * The signed-in editor's email, or `null` without a valid session. Reads cookies, so the page
 * renders per request.
 */
export async function getSignedInEmail(): Promise<string | null> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user?.email ?? null
}

/**
 * True once the first admin account exists. Payload's own login page checks this to offer
 * "Create first user"; since that page now forwards here, the club's page has to check it.
 */
export async function hasAdminAccount(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({ collection: 'users' })
  return totalDocs > 0
}
