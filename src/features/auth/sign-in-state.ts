import type { SignInErrorCode, SignInField } from './domain/sign-in'

/** Result of submitting the sign-in form, shared by the server action and the form. */
export type SignInState =
  | { status: 'idle' }
  | {
      status: 'invalid'
      fieldErrors: Partial<Record<SignInField, SignInErrorCode>>
      email: string
    }
  /**
   * Payload refused the sign-in: wrong email or password (deliberately not saying which), or the
   * account is locked for a while after too many wrong attempts.
   */
  | { status: 'rejected'; reason: 'credentials' | 'locked'; email: string }
  /** Something else went wrong (e.g. the database is unreachable). */
  | { status: 'error'; email: string }

export const INITIAL_SIGN_IN_STATE: SignInState = { status: 'idle' }
