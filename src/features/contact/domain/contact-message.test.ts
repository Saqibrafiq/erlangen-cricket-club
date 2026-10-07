import { describe, expect, it } from 'vitest'

import {
  HONEYPOT_FIELD,
  isSpam,
  MESSAGE_MAX_LENGTH,
  parseContactMessage,
  type ContactParseResult,
} from './contact-message'

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value)
  }
  return data
}

function fieldErrorsOf(result: ContactParseResult) {
  return result.success ? undefined : result.fieldErrors
}

const VALID = {
  name: '  Asha Patel ',
  email: ' asha@example.com ',
  topic: 'membership',
  message: ' I played in Munich last season. ',
  locale: 'de',
}

describe('parseContactMessage', () => {
  it('accepts a complete message and trims the text', () => {
    expect(parseContactMessage(formData(VALID))).toEqual({
      success: true,
      message: {
        name: 'Asha Patel',
        email: 'asha@example.com',
        topic: 'membership',
        message: 'I played in Munich last season.',
        locale: 'de',
      },
    })
  })

  it('reports each missing field as required and keeps what was typed', () => {
    expect(parseContactMessage(formData({ locale: 'en', name: 'Asha' }))).toEqual({
      success: false,
      fieldErrors: { email: 'required', topic: 'required', message: 'required' },
      values: { name: 'Asha', email: '', topic: '', message: '' },
    })
  })

  it('treats a message of only spaces as missing', () => {
    const result = parseContactMessage(formData({ ...VALID, message: '   ' }))

    expect(fieldErrorsOf(result)).toEqual({ message: 'required' })
  })

  it('reports an invalid email address', () => {
    const result = parseContactMessage(formData({ ...VALID, email: 'asha@' }))

    expect(fieldErrorsOf(result)).toEqual({ email: 'invalidEmail' })
  })

  it('reports a message that is too long', () => {
    const result = parseContactMessage(
      formData({ ...VALID, message: 'x'.repeat(MESSAGE_MAX_LENGTH + 1) }),
    )

    expect(fieldErrorsOf(result)).toEqual({ message: 'tooLong' })
  })

  it('rejects topics and locales that the form does not offer', () => {
    const result = parseContactMessage(formData({ ...VALID, topic: 'vip', locale: 'fr' }))

    expect(fieldErrorsOf(result)).toEqual({ topic: 'required' })
  })
})

describe('isSpam', () => {
  it('flags a filled-in honeypot field', () => {
    expect(isSpam(formData({ ...VALID, [HONEYPOT_FIELD]: 'https://spam.example' }))).toBe(true)
  })

  it('lets people through, who never see the honeypot', () => {
    expect(isSpam(formData(VALID))).toBe(false)
    expect(isSpam(formData({ ...VALID, [HONEYPOT_FIELD]: '  ' }))).toBe(false)
  })
})
