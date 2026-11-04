import { beforeEach, describe, expect, it, vi } from 'vitest'

import { INITIAL_SIGN_IN_STATE } from '../sign-in-state'
import {
  enterEditModeAction,
  getAccountAction,
  saveAccountAction,
  signInAction,
  signOutAction,
} from './actions'

const mocks = vi.hoisted(() => {
  // Shaped like Payload's: the action recognises them by status and message, not by class.
  class AuthenticationError extends Error {
    status = 401
    constructor() {
      super('The email or password provided is incorrect.')
    }
  }
  class LockedAuth extends Error {
    status = 401
    constructor() {
      super('This user is locked due to having too many failed login attempts.')
    }
  }
  class ValidationError extends Error {
    data: { errors: { path: string }[] }
    constructor(paths: string[]) {
      super('invalid')
      this.data = { errors: paths.map((path) => ({ path })) }
    }
  }
  return {
    AuthenticationError,
    LockedAuth,
    ValidationError,
    payload: {
      login: vi.fn(),
      auth: vi.fn(),
      update: vi.fn(),
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
  ValidationError: mocks.ValidationError,
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

describe('account actions', () => {
  const USER = { id: 4, email: 'saqib@example.com', name: 'Saqib Rafiq' }

  function formData(fields: Record<string, string>): FormData {
    const data = new FormData()
    for (const [key, value] of Object.entries(fields)) {
      data.append(key, value)
    }
    return data
  }

  beforeEach(() => {
    mocks.payload.auth.mockReset()
    mocks.payload.update.mockReset()
    mocks.payload.logger.error.mockReset()
    mocks.payload.auth.mockResolvedValue({ user: USER })
  })

  it("loads the signed-in editor's name and email", async () => {
    expect(await getAccountAction()).toEqual({
      status: 'ok',
      account: { name: 'Saqib Rafiq', email: 'saqib@example.com' },
    })
  })

  it('changes nothing without a session', async () => {
    mocks.payload.auth.mockResolvedValue({ user: null })

    expect(await getAccountAction()).toEqual({ status: 'unauthorized' })
    expect(await saveAccountAction(formData({ name: 'X', email: 'x@example.com' }))).toEqual({
      status: 'unauthorized',
    })
    expect(mocks.payload.update).not.toHaveBeenCalled()
  })

  it('saves only the own account, as that user', async () => {
    mocks.payload.update.mockResolvedValue({ ...USER, name: 'Saqib A. Rafiq' })

    const result = await saveAccountAction(
      formData({ id: '1', name: 'Saqib A. Rafiq', email: 'Saqib@Example.com' }),
    )

    expect(result).toEqual({
      status: 'saved',
      account: { name: 'Saqib A. Rafiq', email: 'saqib@example.com' },
    })
    expect(mocks.payload.update).toHaveBeenCalledWith({
      collection: 'users',
      id: 4,
      data: { name: 'Saqib A. Rafiq', email: 'saqib@example.com' },
      user: USER,
      overrideAccess: false,
    })
  })

  it('reports invalid fields and an email another account uses', async () => {
    expect(await saveAccountAction(formData({ name: '', email: 'nope' }))).toEqual({
      status: 'invalid',
      fieldErrors: { name: 'required', email: 'email' },
    })

    mocks.payload.update.mockRejectedValue(new mocks.ValidationError(['email']))
    expect(
      await saveAccountAction(formData({ name: 'Saqib', email: 'taken@example.com' })),
    ).toEqual({ status: 'invalid', fieldErrors: { email: 'emailTaken' } })
  })

  it('reports failures', async () => {
    mocks.payload.update.mockRejectedValue(new Error('database down'))
    expect(
      await saveAccountAction(formData({ name: 'Saqib', email: 'saqib@example.com' })),
    ).toEqual({ status: 'error' })

    mocks.payload.auth.mockRejectedValue(new Error('database down'))
    expect(await getAccountAction()).toEqual({ status: 'error' })
    expect(mocks.payload.logger.error).toHaveBeenCalledTimes(2)
  })
})
