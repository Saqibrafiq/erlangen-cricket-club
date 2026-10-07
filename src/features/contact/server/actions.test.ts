import { beforeEach, describe, expect, it, vi } from 'vitest'

import { INITIAL_CONTACT_STATE } from '../contact-form-state'
import { HONEYPOT_FIELD } from '../domain/contact-message'
import { submitContactMessageAction } from './actions'

const payload = vi.hoisted(() => ({
  create: vi.fn(),
  logger: { error: vi.fn() },
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: () => Promise.resolve(payload) }))

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value)
  }
  return data
}

const VALID = {
  name: 'Asha Patel',
  email: 'asha@example.com',
  topic: 'sponsorship',
  message: 'Our company would like to support the club.',
  locale: 'en',
}

describe('submitContactMessageAction', () => {
  beforeEach(() => {
    payload.create.mockReset()
    payload.logger.error.mockReset()
  })

  it('stores a valid message as new, bypassing the closed API access', async () => {
    const state = await submitContactMessageAction(INITIAL_CONTACT_STATE, formData(VALID))

    expect(state).toEqual({ status: 'success' })
    expect(payload.create).toHaveBeenCalledWith({
      collection: 'contact-messages',
      overrideAccess: true,
      data: { ...VALID, status: 'new' },
    })
  })

  it('returns field errors without storing anything', async () => {
    const state = await submitContactMessageAction(
      INITIAL_CONTACT_STATE,
      formData({ ...VALID, email: 'not-an-email' }),
    )

    expect(state).toMatchObject({ status: 'invalid', fieldErrors: { email: 'invalidEmail' } })
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('answers bots like people but stores nothing', async () => {
    const state = await submitContactMessageAction(
      INITIAL_CONTACT_STATE,
      formData({ ...VALID, [HONEYPOT_FIELD]: 'spam' }),
    )

    expect(state).toEqual({ status: 'success' })
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('logs a storage failure and keeps the input so the visitor can retry', async () => {
    payload.create.mockRejectedValueOnce(new Error('database down'))

    const state = await submitContactMessageAction(INITIAL_CONTACT_STATE, formData(VALID))

    expect(state).toEqual({ status: 'error', values: VALID })
    expect(payload.logger.error).toHaveBeenCalled()
  })
})
