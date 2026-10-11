'use server'

import config from '@payload-config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthenticationError, getPayload, LockedAuth } from 'payload'
import { getCookieExpiration } from 'payload/shared'

import { getSafeRedirectPath, parseSignIn } from '../domain/sign-in'
import { REDIRECT_PARAM } from '../paths'
import type { SignInState } from '../sign-in-state'

const USERS_COLLECTION = 'users'

/**
 * Signs an editor in through Payload and opens the admin. The session cookie is the one Payload's
 * admin reads (same name, lifetime and flags), so no second login is needed. Payload locks an
 * account for a while after repeated wrong passwords.
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

  const auth = payload.collections[USERS_COLLECTION].config.auth
  const cookieStore = await cookies()
  cookieStore.set({
    name: `${payload.config.cookiePrefix}-token`,
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: auth.cookies.secure,
    domain: auth.cookies.domain,
    expires: getCookieExpiration({ seconds: auth.tokenExpiration }),
  })

  // Outside the try: redirect() works by throwing.
  redirect(getSafeRedirectPath(formData.get(REDIRECT_PARAM)))
}
