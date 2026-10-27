import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deleteSponsorAction,
  getInactiveSponsorsAction,
  getSponsorAction,
  saveSponsorAction,
} from './actions'

const mocks = vi.hoisted(() => ({
  payload: {
    auth: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    logger: { error: vi.fn() },
  },
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: () => Promise.resolve(mocks.payload) }))
vi.mock('next/headers', () => ({ headers: () => Promise.resolve(new Headers()) }))

const { payload } = mocks
const USER = { id: 1, collection: 'users' }
const AS_EDITOR = { user: USER, overrideAccess: false }
const LOGO = new File([new Uint8Array(8)], 'logo.webp', { type: 'image/webp' })

function formData(fields: Record<string, string | File>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value)
  }
  return data
}

const FIELDS = {
  name: 'mein-banker',
  tier: 'title',
  since: '2024',
  descriptionEn: 'Our title sponsor.',
  descriptionDe: 'Unser Hauptsponsor.',
  website: '',
  isActive: 'on',
}
const SPONSOR_DOC = {
  id: 4,
  name: 'mein-banker',
  logo: { id: 11, url: '/media/logo.png', alt: 'mein-banker logo', width: 400, height: 200 },
  tier: 'title',
  since: 2024,
  description: 'Our title sponsor.',
  website: null,
  isActive: true,
}

describe('sponsor editing actions', () => {
  beforeEach(() => {
    for (const mock of [
      payload.auth,
      payload.find,
      payload.findByID,
      payload.create,
      payload.update,
      payload.delete,
      payload.logger.error,
    ]) {
      mock.mockReset()
    }
    payload.auth.mockResolvedValue({ user: USER })
  })

  it('change nothing without a session and ask to sign in again', async () => {
    payload.auth.mockResolvedValue({ user: null })

    expect(await saveSponsorAction(formData(FIELDS))).toEqual({ status: 'unauthorized' })
    expect(await deleteSponsorAction(4)).toEqual({ status: 'unauthorized' })
    expect(await getSponsorAction(4)).toEqual({ status: 'unauthorized' })
    expect(await getInactiveSponsorsAction()).toEqual({ status: 'unauthorized' })
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it('loads a sponsor with both descriptions, without falling back to English', async () => {
    payload.findByID.mockImplementation(({ locale }: { locale: string }) =>
      Promise.resolve(
        locale === 'de' ? { ...SPONSOR_DOC, description: 'Unser Hauptsponsor.' } : SPONSOR_DOC,
      ),
    )

    const result = await getSponsorAction(4)

    expect(result).toMatchObject({
      status: 'ok',
      data: {
        id: 4,
        descriptionEn: 'Our title sponsor.',
        descriptionDe: 'Unser Hauptsponsor.',
        logo: { url: '/media/logo.png' },
      },
    })
    expect(payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'de', fallbackLocale: false, ...AS_EDITOR }),
    )
  })

  it('lists the sponsors not shown on the website', async () => {
    payload.find.mockResolvedValue({ docs: [{ id: 5, name: 'Old Partner' }] })

    expect(await getInactiveSponsorsAction()).toEqual({
      status: 'ok',
      data: [{ id: 5, name: 'Old Partner' }],
    })
  })

  it('adds a sponsor with its logo, in English and then German', async () => {
    payload.create.mockImplementation(({ collection }: { collection: string }) =>
      Promise.resolve(collection === 'media' ? { id: 11 } : { id: 4, isActive: true }),
    )
    payload.update.mockResolvedValue(SPONSOR_DOC)

    const result = await saveSponsorAction(formData({ ...FIELDS, logo: LOGO }))

    expect(result).toEqual({ status: 'saved', sponsor: { id: 4, isActive: true } })
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'sponsors',
        locale: 'en',
        data: expect.objectContaining({ logo: 11, description: 'Our title sponsor.' }) as unknown,
        ...AS_EDITOR,
      }),
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 4,
        locale: 'de',
        data: { description: 'Unser Hauptsponsor.' },
      }),
    )
  })

  it('updates a sponsor and keeps its logo when none is chosen', async () => {
    payload.update.mockResolvedValue({ ...SPONSOR_DOC, isActive: false })

    const result = await saveSponsorAction(formData({ ...FIELDS, id: '4', isActive: '' }))

    expect(result).toEqual({ status: 'saved', sponsor: { id: 4, isActive: false } })
    expect(payload.create).not.toHaveBeenCalled()
    const [english] = payload.update.mock.calls[0] as [{ data: Record<string, unknown> }]
    expect(english.data).not.toHaveProperty('logo')
  })

  it('returns field errors without touching the database', async () => {
    const result = await saveSponsorAction(formData({ ...FIELDS, name: '' }))

    expect(result).toEqual({
      status: 'invalid',
      fieldErrors: { name: 'required', logo: 'logoRequired' },
    })
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('reports a failed save', async () => {
    payload.update.mockRejectedValue(new Error('database down'))

    expect(await saveSponsorAction(formData({ ...FIELDS, id: '4' }))).toEqual({ status: 'error' })
    expect(payload.logger.error).toHaveBeenCalled()
  })

  it('deletes a sponsor and keeps its logo in the media library', async () => {
    payload.delete.mockResolvedValue(SPONSOR_DOC)

    expect(await deleteSponsorAction(4)).toEqual({ status: 'deleted' })
    expect(payload.delete).toHaveBeenCalledOnce()
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'sponsors', id: 4 }),
    )
  })

  it('rejects ids that are not ids', async () => {
    expect(await deleteSponsorAction(-1)).toEqual({ status: 'error' })
    expect(await getSponsorAction(0)).toEqual({ status: 'error' })
  })
})
