import { beforeEach, describe, expect, it, vi } from 'vitest'

import { INITIAL_SIGN_IN_STATE } from '../sign-in-state'
import { enterEditModeAction, signInAction, signOutAction } from './actions'

const mocks = vi.hoisted(() => {
  class AuthenticationError extends Error {}
  class LockedAuth extends Error {}
  return {
    AuthenticationError,
    LockedAuth,
    payload: {
      login: vi.fn(),
      auth: vi.fn(),
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
    deleteCookie: vi.fn(),
    logout: vi.fn(),
  }
})

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: () => Promise.resolve(mocks.payload),
  AuthenticationError: mocks.AuthenticationError,
  LockedAuth: mocks.LockedAuth,
}))
vi.mock('payload/shared', () => ({ getCookieExpiration: () => new Date('2026-10-11T20:00:00Z') }))
vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ set: mocks.setCookie, delete: mocks.deleteCookie }),
  headers: () => Promise.resolve(new Headers()),
}))
vi.mock('@payloadcms/next/auth', () => ({ logout: mocks.logout }))

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
  })

  it('sets the session and edit-mode cookies and returns the page to open', async () => {
    mocks.payload.login.mockResolvedValue({ token: 'jwt-token' })

    const state = await signInAction(
      INITIAL_SIGN_IN_STATE,
      formData({ ...VALID, redirect: '/admin/collections/news' }),
    )

    expect(state).toEqual({ status: 'success', redirectTo: '/admin/collections/news' })
    expect(mocks.payload.login).toHaveBeenCalledWith({ collection: 'users', data: VALID })
    const shared = {
      path: '/',
      sameSite: 'lax',
      secure: true,
      domain: undefined,
      expires: new Date('2026-10-11T20:00:00Z'),
    }
    expect(mocks.setCookie).toHaveBeenCalledWith({
      ...shared,
      name: 'payload-token',
      value: 'jwt-token',
      httpOnly: true,
    })
    expect(mocks.setCookie).toHaveBeenCalledWith({
      ...shared,
      name: 'ecc-editor',
      value: '1',
      httpOnly: false,
    })
  })

  it('opens the website when no page was requested, and never another site', async () => {
    mocks.payload.login.mockResolvedValue({ token: 'jwt-token' })

    expect(await signInAction(INITIAL_SIGN_IN_STATE, formData(VALID))).toEqual({
      status: 'success',
      redirectTo: '/',
    })
    expect(
      await signInAction(
        INITIAL_SIGN_IN_STATE,
        formData({ ...VALID, redirect: 'https://evil.example' }),
      ),
    ).toEqual({ status: 'success', redirectTo: '/' })
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

describe('signOutAction', () => {
  it("ends Payload's session and removes the edit-mode cookie", async () => {
    await signOutAction()

    expect(mocks.logout).toHaveBeenCalledWith({ config: {} })
    expect(mocks.deleteCookie).toHaveBeenCalledWith('ecc-editor')
  })
})

describe('enterEditModeAction', () => {
  beforeEach(() => {
    mocks.setCookie.mockReset()
  })

  it('switches edit mode on next to a valid session', async () => {
    mocks.payload.auth.mockResolvedValue({ user: { id: 1 } })

    expect(await enterEditModeAction()).toEqual({ status: 'ok' })
    expect(mocks.setCookie).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'ecc-editor', value: '1' }),
    )
  })

  it('refuses without a session', async () => {
    mocks.payload.auth.mockResolvedValue({ user: null })

    expect(await enterEditModeAction()).toEqual({ status: 'unauthorized' })
    expect(mocks.setCookie).not.toHaveBeenCalled()
  })
})
