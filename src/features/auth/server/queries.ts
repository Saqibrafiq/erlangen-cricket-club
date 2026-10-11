import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

/** True when the request carries a valid admin session. Reads cookies, so the page renders per request. */
export async function isSignedIn(): Promise<boolean> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user !== null
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
