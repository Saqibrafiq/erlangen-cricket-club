import { describe, expect, it } from 'vitest'

import { REASON_MAX_LENGTH, validateOneEvent, validateReason } from './validate-event'

function oneEvent(siblingData: object) {
  return validateOneEvent(undefined, { siblingData } as never)
}

function reason(value: string | null | undefined, response: string) {
  return validateReason(value, { siblingData: { response } } as never)
}

describe('validateOneEvent', () => {
  it('accepts a match or a practice', () => {
    expect(oneEvent({ fixture: 3 })).toBe(true)
    expect(oneEvent({ practice: 5, fixture: null })).toBe(true)
  })

  it('refuses both or neither', () => {
    expect(oneEvent({ fixture: 3, practice: 5 })).toBe('Choose either a match or a practice.')
    expect(oneEvent({ fixture: '', practice: undefined })).toBe(
      'Choose either a match or a practice.',
    )
  })
})

describe('validateReason', () => {
  it('needs no reason for going', () => {
    expect(reason(undefined, 'going')).toBe(true)
  })

  it('needs a reason for not going', () => {
    expect(reason('  ', 'not-going')).toBe('Please give a reason for not going.')
    expect(reason(null, 'not-going')).toBe('Please give a reason for not going.')
    expect(reason('Working late', 'not-going')).toBe(true)
  })

  it('keeps the reason short', () => {
    expect(reason('x'.repeat(REASON_MAX_LENGTH + 1), 'not-going')).toBe(
      'Keep it under 300 characters.',
    )
  })
})
