/*
 * Payload's errors, recognised by their shape rather than `instanceof`: in a production build
 * Payload's error classes can be bundled into more than one server chunk, and an error thrown by
 * one copy is not an instance of the other. Which copy a server action sees depends on which page
 * loaded it first, so `instanceof` checks fail only sometimes.
 */

const UNAUTHORIZED = 401
/** Payload's LockedAuth message: "This user is locked due to having too many failed login attempts." */
const LOCKED_MESSAGE = /locked/i

type PayloadError = { status?: unknown; message?: unknown; data?: unknown }

function asPayloadError(error: unknown): PayloadError | null {
  return typeof error === 'object' && error !== null ? error : null
}

/** A rejected sign-in: wrong email or password, or an account locked after failed attempts. */
export function getSignInRejection(error: unknown): 'credentials' | 'locked' | null {
  const candidate = asPayloadError(error)
  if (candidate?.status !== UNAUTHORIZED) {
    return null
  }
  return typeof candidate.message === 'string' && LOCKED_MESSAGE.test(candidate.message)
    ? 'locked'
    : 'credentials'
}

/** True when Payload rejected a write because of the field at `path`, e.g. a duplicate slug. */
export function isValidationErrorFor(error: unknown, path: string): boolean {
  const data = asPayloadError(error)?.data
  if (typeof data !== 'object' || data === null || !('errors' in data)) {
    return false
  }
  const { errors } = data
  return (
    Array.isArray(errors) &&
    errors.some(
      (entry: unknown) =>
        typeof entry === 'object' && entry !== null && 'path' in entry && entry.path === path,
    )
  )
}
