import { useSyncExternalStore } from 'react'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'

function hasEditModeCookie(): boolean {
  return document.cookie.split('; ').some((cookie) => cookie === `${EDIT_MODE_COOKIE}=1`)
}

// Signing in and out reload the page, so the cookie never changes while a page is open.
function subscribe(): () => void {
  return () => undefined
}

/**
 * True in a signed-in editor's browser (see `EDIT_MODE_COOKIE`). Always false on the server and
 * during hydration, so a static page is identical for everyone until it has loaded.
 */
export function useIsEditMode(): boolean {
  return useSyncExternalStore(subscribe, hasEditModeCookie, () => false)
}
