'use server'

import config from '@payload-config'
import { logout } from '@payloadcms/next/auth'
import { cookies, headers } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import { getCookieExpiration } from 'payload/shared'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'
import { getSignInRejection, isValidationErrorFor } from '@/shared/lib/payload-errors'

import { parseAccountForm } from '../domain/account'
import { getSafeRedirectPath, parseSignIn } from '../domain/sign-in'
import { REDIRECT_PARAM } from '../paths'
import type {
  AccountResult,
  EditModeResult,
  SaveAccountResult,
  SignInState,
} from '../sign-in-state'

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
    const rejection = getSignInRejection(error)
    if (rejection) {
      return { status: 'rejected', reason: rejection, email }
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

/** The signed-in editor's name and email, for the account menu. */
export async function getAccountAction(): Promise<AccountResult> {
  const payload = await getPayload({ config })
  try {
    const { user } = await payload.auth({ headers: await headers() })
    if (!user) {
      return { status: 'unauthorized' }
    }
    return { status: 'ok', account: { name: user.name ?? null, email: user.email } }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not load the account')
    return { status: 'error' }
  }
}

/**
 * Saves the signed-in editor's own name and email, as that user with access control on. Only the
 * own account: the id comes from the session, never from the form.
 */
export async function saveAccountAction(formData: FormData): Promise<SaveAccountResult> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return { status: 'unauthorized' }
  }
  const parsed = parseAccountForm(formData)
  if (!parsed.success) {
    return { status: 'invalid', fieldErrors: parsed.fieldErrors }
  }

  try {
    const doc = await payload.update({
      collection: USERS_COLLECTION,
      id: user.id,
      data: parsed.account,
      user,
      overrideAccess: false,
    })
    return { status: 'saved', account: { name: doc.name ?? null, email: doc.email } }
  } catch (error) {
    if (isValidationErrorFor(error, 'email')) {
      return { status: 'invalid', fieldErrors: { email: 'emailTaken' } }
    }
    payload.logger.error({ err: error }, 'Could not save the account')
    return { status: 'error' }
  }
}
