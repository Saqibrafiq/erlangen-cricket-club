import { describe, expect, it } from 'vitest'

import { getSignInRejection, isValidationErrorFor } from './payload-errors'

/** Stand-ins shaped like Payload's errors, not instances of its classes (as after bundling). */
function apiError(status: number, message: string, data: unknown = null) {
  return Object.assign(new Error(message), { status, data })
}

describe('getSignInRejection', () => {
  it('recognises wrong credentials and a locked account by status and message', () => {
    expect(getSignInRejection(apiError(401, 'The email or password provided is incorrect.'))).toBe(
      'credentials',
    )
    expect(
      getSignInRejection(
        apiError(401, 'This user is locked due to having too many failed login attempts.'),
      ),
    ).toBe('locked')
  })

  it('is nothing for other errors', () => {
    expect(getSignInRejection(apiError(500, 'Database down'))).toBeNull()
    expect(getSignInRejection(new Error('boom'))).toBeNull()
    expect(getSignInRejection('boom')).toBeNull()
    expect(getSignInRejection(null)).toBeNull()
  })
})

describe('isValidationErrorFor', () => {
  const duplicateSlug = apiError(400, 'invalid', { errors: [{ path: 'slug', message: 'taken' }] })

  it('finds the field Payload rejected', () => {
    expect(isValidationErrorFor(duplicateSlug, 'slug')).toBe(true)
    expect(isValidationErrorFor(duplicateSlug, 'email')).toBe(false)
  })

  it('is false for errors without field errors', () => {
    expect(isValidationErrorFor(apiError(400, 'invalid', { errors: 'nope' }), 'slug')).toBe(false)
    expect(isValidationErrorFor(apiError(400, 'invalid', { errors: [null, 'x'] }), 'slug')).toBe(
      false,
    )
    expect(isValidationErrorFor(apiError(400, 'invalid'), 'slug')).toBe(false)
    expect(isValidationErrorFor(undefined, 'slug')).toBe(false)
  })
})
