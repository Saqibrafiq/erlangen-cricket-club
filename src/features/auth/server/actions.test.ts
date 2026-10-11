import { beforeEach, describe, expect, it, vi } from 'vitest'

import { INITIAL_SIGN_IN_STATE } from '../sign-in-state'
import { signInAction } from './actions'

const mocks = vi.hoisted(() => {
  class AuthenticationError extends Error {}
  class LockedAuth extends Error {}
  return {
    AuthenticationError,
    LockedAuth,
    payload: {
      login: vi.fn(),
      logger: { error: vi.fn() },
      config: { cookiePrefix: 'payload' },
      collections: {
        users: {
          config: {
            auth: { tokenExpiration: 7200, cookies: { secure: true, domain: undefined } },
          },
        },
      },
    },
    setCookie: vi.fn(),
    redirect: vi.fn((path: string) => {
      throw new Error(`NEXT_REDIRECT ${path}`)
    }),
  }
})

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: () => Promise.resolve(mocks.payload),
  AuthenticationError: mocks.AuthenticationError,
  LockedAuth: mocks.LockedAuth,
}))
vi.mock('payload/shared', () => ({ getCookieExpiration: () => new Date('2026-10-11T20:00:00Z') }))
vi.mock('next/headers', () => ({ cookies: () => Promise.resolve({ set: mocks.setCookie }) }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value)
  }
  return data
}

const VALID = { email: 'admin@example.com', password: 'correct horse' }

describe('signInAction', () => {
  beforeEach(() => {
    mocks.payload.login.mockReset()
    mocks.payload.logger.error.mockReset()
    mocks.setCookie.mockReset()
    mocks.redirect.mockClear()
  })

  it('sets the admin session cookie and opens the requested admin page', async () => {
    mocks.payload.login.mockResolvedValue({ token: 'jwt-token' })

    await expect(
      signInAction(
        INITIAL_SIGN_IN_STATE,
        formData({ ...VALID, redirect: '/admin/collections/news' }),
      ),
    ).rejects.toThrow('NEXT_REDIRECT /admin/collections/news')

    expect(mocks.payload.login).toHaveBeenCalledWith({ collection: 'users', data: VALID })
    expect(mocks.setCookie).toHaveBeenCalledWith({
      name: 'payload-token',
      value: 'jwt-token',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: true,
      domain: undefined,
      expires: new Date('2026-10-11T20:00:00Z'),
    })
  })

  it('never redirects outside the admin', async () => {
    mocks.payload.login.mockResolvedValue({ token: 'jwt-token' })

    await expect(
      signInAction(INITIAL_SIGN_IN_STATE, formData({ ...VALID, redirect: 'https://evil.example' })),
    ).rejects.toThrow('NEXT_REDIRECT /admin')
  })

  it('returns field errors without asking Payload', async () => {
    const state = await signInAction(INITIAL_SIGN_IN_STATE, formData({ email: 'admin' }))

    expect(state).toEqual({
      status: 'invalid',
      fieldErrors: { email: 'invalidEmail', password: 'required' },
      email: 'admin',
    })
    expect(mocks.payload.login).not.toHaveBeenCalled()
  })

  it('rejects wrong credentials without saying which part was wrong', async () => {
    mocks.payload.login.mockRejectedValue(new mocks.AuthenticationError())

    const state = await signInAction(INITIAL_SIGN_IN_STATE, formData(VALID))

    expect(state).toEqual({ status: 'rejected', reason: 'credentials', email: VALID.email })
    expect(mocks.setCookie).not.toHaveBeenCalled()
  })

  it('reports a locked account', async () => {
    mocks.payload.login.mockRejectedValue(new mocks.LockedAuth())

    const state = await signInAction(INITIAL_SIGN_IN_STATE, formData(VALID))

    expect(state).toEqual({ status: 'rejected', reason: 'locked', email: VALID.email })
  })

  it('logs unexpected failures and reports a server error', async () => {
    mocks.payload.login.mockRejectedValue(new Error('database unreachable'))

    const state = await signInAction(INITIAL_SIGN_IN_STATE, formData(VALID))

    expect(state).toEqual({ status: 'error', email: VALID.email })
    expect(mocks.payload.logger.error).toHaveBeenCalled()
  })

  it('treats a login without a token as a server error', async () => {
    mocks.payload.login.mockResolvedValue({})

    const state = await signInAction(INITIAL_SIGN_IN_STATE, formData(VALID))

    expect(state).toEqual({ status: 'error', email: VALID.email })
    expect(mocks.setCookie).not.toHaveBeenCalled()
  })
})
