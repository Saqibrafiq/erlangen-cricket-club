import { beforeEach, describe, expect, it, vi } from 'vitest'

import { hasAdminAccount, isSignedIn } from './queries'

const payload = vi.hoisted(() => ({ auth: vi.fn(), count: vi.fn() }))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: () => Promise.resolve(payload) }))
vi.mock('next/headers', () => ({ headers: () => Promise.resolve(new Headers()) }))

describe('auth queries', () => {
  beforeEach(() => {
    payload.auth.mockReset()
    payload.count.mockReset()
  })

  it('knows whether the request carries a valid session', async () => {
    payload.auth.mockResolvedValueOnce({ user: { id: 1 } }).mockResolvedValueOnce({ user: null })

    expect(await isSignedIn()).toBe(true)
    expect(await isSignedIn()).toBe(false)
  })

  it('reports whether the first admin account exists yet', async () => {
    payload.count.mockResolvedValueOnce({ totalDocs: 0 }).mockResolvedValueOnce({ totalDocs: 2 })

    expect(await hasAdminAccount()).toBe(false)
    expect(await hasAdminAccount()).toBe(true)
    expect(payload.count).toHaveBeenCalledWith({ collection: 'users' })
  })
})
