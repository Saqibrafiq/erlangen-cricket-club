import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Payload, type TypedUser } from 'payload'

import { isAdmin } from '@/cms/access/roles'

/** A signed-in admin, with the Payload instance to act as them (access control stays on). */
export type Editor = { payload: Payload; user: TypedUser }

/**
 * The signed-in admin, or `null`. Members of the app have accounts too, but only the Board edits
 * the website (ADR-0024), so a member's session counts as signed out here.
 */
export async function getEditor(): Promise<Editor | null> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user && isAdmin(user) ? { payload, user } : null
}
