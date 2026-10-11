'use server'

import config from '@payload-config'
import { logout } from '@payloadcms/next/auth'
import { cookies, headers } from 'next/headers'
import { AuthenticationError, getPayload, LockedAuth, type Payload } from 'payload'
import { getCookieExpiration } from 'payload/shared'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'

import { getSafeRedirectPath, parseSignIn } from '../domain/sign-in'
import { REDIRECT_PARAM } from '../paths'
import type { EditModeResult, SignInState } from '../sign-in-state'

const USERS_COLLECTION = 'users'

/** Flags shared by the session and edit-mode cookies: same lifetime as Payload's session. */
function getCookieOptions(payload: Payload) {
  const auth = payload.collections[USERS_COLLECTION].config.auth
  return {
    path: '/',
    sameSite: 'lax',
    secure: auth.cookies.secure,
    domain: auth.cookies.domain,
    expires: getCookieExpiration({ seconds: auth.tokenExpiration }),
  } as const
}

/**
 * Signs an editor in through Payload. The session cookie is the one Payload's admin reads (same
 * name, lifetime and flags), so no second login is needed; a readable hint cookie next to it
 * switches the static pages into edit mode. Payload locks an account for a while after repeated
 * wrong passwords.
 */
export async function signInAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const result = parseSignIn(formData)
  if (!result.success) {
    return { status: 'invalid', fieldErrors: result.fieldErrors, email: result.email }
  }

  const { email } = result.credentials
  const payload = await getPayload({ config })
  let token: string | undefined
  try {
    ;({ token } = await payload.login({ collection: USERS_COLLECTION, data: result.credentials }))
  } catch (error) {
    if (error instanceof LockedAuth) {
      return { status: 'rejected', reason: 'locked', email }
    }
    if (error instanceof AuthenticationError) {
      return { status: 'rejected', reason: 'credentials', email }
    }
    payload.logger.error({ err: error }, 'Sign-in failed')
    return { status: 'error', email }
  }

  if (!token) {
    payload.logger.error('Sign-in succeeded without a session token')
    return { status: 'error', email }
  }

  const shared = getCookieOptions(payload)
  const cookieStore = await cookies()
  cookieStore.set({
    ...shared,
    name: `${payload.config.cookiePrefix}-token`,
    value: token,
    httpOnly: true,
  })
  cookieStore.set({ ...shared, name: EDIT_MODE_COOKIE, value: '1', httpOnly: false })

  return { status: 'success', redirectTo: getSafeRedirectPath(formData.get(REDIRECT_PARAM)) }
}

/**
 * Switches edit mode on for an editor who is already signed in (e.g. through the admin), after
 * checking the session: the hint cookie is only ever set next to a valid one.
 */
export async function enterEditModeAction(): Promise<EditModeResult> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return { status: 'unauthorized' }
  }

  const cookieStore = await cookies()
  cookieStore.set({ ...getCookieOptions(payload), name: EDIT_MODE_COOKIE, value: '1' })
  return { status: 'ok' }
}

/**
 * Ends the editor's session (Payload removes it server-side and deletes its cookie) and drops the
 * edit-mode hint. The admin bar then reloads the page for visitors' view.
 */
export async function signOutAction(): Promise<void> {
  await logout({ config })
  const cookieStore = await cookies()
  cookieStore.delete(EDIT_MODE_COOKIE)
}
