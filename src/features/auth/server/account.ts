import type { AccountActions } from '../sign-in-state'
import { getAccountAction, saveAccountAction, signInAction, signOutAction } from './actions'

/** What the layout hands to the header's account menu. */
export const ACCOUNT_ACTIONS: AccountActions = {
  signIn: signInAction,
  getAccount: getAccountAction,
  saveAccount: saveAccountAction,
  signOut: signOutAction,
}
