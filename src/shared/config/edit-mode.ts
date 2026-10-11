/**
 * Readable hint cookie set at sign-in next to Payload's (HttpOnly) session cookie. It tells the
 * static pages to load their editing controls and grants nothing: every change is authorised on
 * the server against the session itself. Kept apart from the hook so server code can import it.
 */
export const EDIT_MODE_COOKIE = 'ecc-editor'
