/** Set on sign-in, read once the reloaded page knows who signed in. */
const WELCOME_KEY = 'ecc-welcome'

/** Call right before the page reloads after signing in. */
export function rememberWelcome(): void {
  try {
    sessionStorage.setItem(WELCOME_KEY, '1')
  } catch {
    // Storage blocked: no welcome message, everything else works.
  }
}

/** True once after a sign-in: the account menu then greets the editor by name. */
export function takeWelcome(): boolean {
  try {
    const isPending = sessionStorage.getItem(WELCOME_KEY) !== null
    sessionStorage.removeItem(WELCOME_KEY)
    return isPending
  } catch {
    return false
  }
}
