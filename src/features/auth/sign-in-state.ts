import type { Account, AccountFieldErrors } from './domain/account'
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
  /**
   * Signed in. The form loads `redirectTo` as a full page, so every static page and the admin
   * bar pick up edit mode (a client-side navigation would keep the mounted layout as it was).
   */
  | { status: 'success'; redirectTo: string }

export const INITIAL_SIGN_IN_STATE: SignInState = { status: 'idle' }

/** Result of switching edit mode on for an existing session. */
export type EditModeResult = { status: 'ok' } | { status: 'unauthorized' }

/** The signed-in account for the account menu. */
export type AccountResult =
  { status: 'ok'; account: Account } | { status: 'unauthorized' } | { status: 'error' }

export type SaveAccountResult =
  | { status: 'saved'; account: Account }
  | { status: 'invalid'; fieldErrors: AccountFieldErrors }
  | { status: 'unauthorized' }
  | { status: 'error' }

/** The server actions the account menu calls, passed in by the layout. */
export type AccountActions = {
  signIn: (state: SignInState, formData: FormData) => Promise<SignInState>
  getAccount: () => Promise<AccountResult>
  saveAccount: (formData: FormData) => Promise<SaveAccountResult>
  signOut: () => Promise<void>
}
