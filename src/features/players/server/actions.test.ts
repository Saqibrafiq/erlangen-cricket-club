import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deletePlayerAction,
  getHiddenPlayersAction,
  getPlayerEditorDataAction,
  savePlayerAction,
} from './actions'

const mocks = vi.hoisted(() => {
  class ValidationError extends Error {
    data: { errors: { path: string }[] }
    constructor(paths: string[]) {
      super('invalid')
      this.data = { errors: paths.map((path) => ({ path })) }
    }
  }
  return {
    ValidationError,
    payload: {
      auth: vi.fn(),
      find: vi.fn(),
      findByID: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      logger: { error: vi.fn() },
    },
  }
})

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: () => Promise.resolve(mocks.payload),
  ValidationError: mocks.ValidationError,
}))
vi.mock('next/headers', () => ({ headers: () => Promise.resolve(new Headers()) }))

const { payload } = mocks
const USER = { id: 1, collection: 'users' }
const AS_EDITOR = { user: USER, overrideAccess: false }

function formData(fields: Record<string, string | File>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value)
  }
  return data
}

const PHOTO = new File([new Uint8Array(8)], 'photo.webp', { type: 'image/webp' })
const SAVED_DOC = { id: 7, slug: 'saqib-rafiq', hasPublishConsent: true }

describe('player editing actions', () => {
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

  describe('without a session', () => {
    beforeEach(() => {
      payload.auth.mockResolvedValue({ user: null })
    })

    it('change nothing and ask to sign in again', async () => {
      expect(await savePlayerAction(formData({ name: 'Saqib Rafiq' }))).toEqual({
        status: 'unauthorized',
      })
      expect(await deletePlayerAction(7)).toEqual({ status: 'unauthorized' })
      expect(await getPlayerEditorDataAction(7, 'en')).toEqual({ status: 'unauthorized' })
      expect(await getHiddenPlayersAction()).toEqual({ status: 'unauthorized' })
      expect(payload.create).not.toHaveBeenCalled()
      expect(payload.update).not.toHaveBeenCalled()
      expect(payload.delete).not.toHaveBeenCalled()
    })
  })

  describe('savePlayerAction', () => {
    it('adds a player as the signed-in editor, with access control on', async () => {
      payload.create.mockResolvedValue({ ...SAVED_DOC, hasPublishConsent: false })

      const result = await savePlayerAction(
        formData({ name: 'Saqib Rafiq', playingRole: 'bowler', locale: 'de' }),
      )

      expect(result).toEqual({
        status: 'saved',
        player: { id: 7, slug: 'saqib-rafiq', isPublic: false },
      })
      expect(payload.create).toHaveBeenCalledWith({
        collection: 'players',
        data: expect.objectContaining({
          name: 'Saqib Rafiq',
          slug: 'saqib-rafiq',
          playingRole: 'bowler',
        }) as unknown,
        locale: 'de',
        ...AS_EDITOR,
      })
      // No photo field sent: an existing photo stays untouched.
      expect(payload.create.mock.calls[0]?.[0]).not.toHaveProperty('data.photo')
    })

    it('replaces the photo and deletes the old one', async () => {
      payload.findByID.mockResolvedValue({ id: 7, photo: 30 })
      payload.create.mockResolvedValue({ id: 41 })
      payload.update.mockResolvedValue(SAVED_DOC)

      await savePlayerAction(formData({ id: '7', name: 'Saqib Rafiq', photo: PHOTO }))

      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'media',
          data: { alt: 'Saqib Rafiq' },
          file: expect.objectContaining({
            mimetype: 'image/webp',
            name: 'player-saqib-rafiq.webp',
          }) as unknown,
          ...AS_EDITOR,
        }),
      )
      expect(payload.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 7,
          data: expect.objectContaining({ photo: 41 }) as unknown,
        }),
      )
      expect(payload.delete).toHaveBeenCalledWith({ collection: 'media', id: 30, ...AS_EDITOR })
    })

    it('removes the photo when asked', async () => {
      payload.findByID.mockResolvedValue({ id: 7, photo: { id: 30 } })
      payload.update.mockResolvedValue(SAVED_DOC)

      await savePlayerAction(formData({ id: '7', name: 'Saqib Rafiq', removePhoto: 'on' }))

      expect(payload.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ photo: null }) as unknown }),
      )
      expect(payload.delete).toHaveBeenCalledWith({ collection: 'media', id: 30, ...AS_EDITOR })
    })

    it('returns field errors without writing anything', async () => {
      expect(await savePlayerAction(formData({ name: '' }))).toEqual({
        status: 'invalid',
        fieldErrors: { name: 'required' },
      })
      expect(payload.create).not.toHaveBeenCalled()
    })

    it('reports a name another player already has, and removes the unused upload', async () => {
      payload.create
        .mockResolvedValueOnce({ id: 41 })
        .mockRejectedValueOnce(new mocks.ValidationError(['slug']))

      const result = await savePlayerAction(formData({ name: 'Saqib Rafiq', photo: PHOTO }))

      expect(result).toEqual({ status: 'invalid', fieldErrors: { name: 'duplicateName' } })
      expect(payload.delete).toHaveBeenCalledWith({ collection: 'media', id: 41, ...AS_EDITOR })
    })

    it('logs other failures and reports a server error', async () => {
      payload.create.mockRejectedValue(new mocks.ValidationError(['name']))

      expect(await savePlayerAction(formData({ name: 'Saqib Rafiq' }))).toEqual({
        status: 'error',
      })
      expect(payload.logger.error).toHaveBeenCalled()
    })

    it('keeps the saved player when deleting the old photo fails', async () => {
      payload.findByID.mockResolvedValue({ id: 7, photo: 30 })
      payload.update.mockResolvedValue(SAVED_DOC)
      payload.delete.mockRejectedValue(new Error('storage down'))

      const result = await savePlayerAction(
        formData({ id: '7', name: 'Saqib Rafiq', removePhoto: 'on' }),
      )

      expect(result).toMatchObject({ status: 'saved' })
      expect(payload.logger.error).toHaveBeenCalled()
    })
  })

  describe('deletePlayerAction', () => {
    it('deletes the player and their photo', async () => {
      payload.delete.mockResolvedValueOnce({ id: 7, photo: 30 }).mockResolvedValueOnce({})

      expect(await deletePlayerAction(7)).toEqual({ status: 'deleted' })
      expect(payload.delete).toHaveBeenNthCalledWith(1, {
        collection: 'players',
        id: 7,
        depth: 0,
        ...AS_EDITOR,
      })
      expect(payload.delete).toHaveBeenNthCalledWith(2, {
        collection: 'media',
        id: 30,
        ...AS_EDITOR,
      })
    })

    it('deletes a player without a photo', async () => {
      payload.delete.mockResolvedValue({ id: 7, photo: null })

      expect(await deletePlayerAction(7)).toEqual({ status: 'deleted' })
      expect(payload.delete).toHaveBeenCalledOnce()
    })

    it('refuses ids that are not ids, and reports failures', async () => {
      expect(await deletePlayerAction(-1)).toEqual({ status: 'error' })
      expect(payload.delete).not.toHaveBeenCalled()

      payload.delete.mockRejectedValue(new Error('not found'))
      expect(await deletePlayerAction(7)).toEqual({ status: 'error' })
      expect(payload.logger.error).toHaveBeenCalled()
    })
  })

  describe('getPlayerEditorDataAction', () => {
    it('returns the club teams and the player to edit, consent included', async () => {
      payload.find.mockResolvedValue({ docs: [{ id: 1, name: 'Erlangen Cricket Club I' }] })
      payload.findByID.mockResolvedValue({
        id: 7,
        name: 'Saqib Rafiq',
        slug: 'saqib-rafiq',
        photo: null,
        teams: [{ id: 1, name: 'Erlangen Cricket Club I' }],
        hasPublishConsent: true,
        consentNote: 'Membership form',
      })

      const result = await getPlayerEditorDataAction(7, 'de')

      expect(result).toEqual({
        status: 'ok',
        data: {
          teams: [{ id: 1, name: 'Erlangen Cricket Club I' }],
          draft: expect.objectContaining({
            id: 7,
            teams: [1],
            hasPublishConsent: true,
            consentNote: 'Membership form',
          }) as unknown,
        },
      })
      expect(payload.findByID).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, locale: 'de', ...AS_EDITOR }),
      )
    })

    it('has no draft for a new player, and falls back to English for an unknown locale', async () => {
      payload.find.mockResolvedValue({ docs: [] })

      expect(await getPlayerEditorDataAction(null, 'xx')).toEqual({
        status: 'ok',
        data: { teams: [], draft: null },
      })
      expect(payload.findByID).not.toHaveBeenCalled()
    })

    it('reports a failure to load', async () => {
      payload.find.mockRejectedValue(new Error('database down'))

      expect(await getPlayerEditorDataAction(7, 'en')).toEqual({ status: 'error' })
    })
  })

  describe('getHiddenPlayersAction', () => {
    it('lists players without recorded consent', async () => {
      payload.find.mockResolvedValue({ docs: [{ id: 3, name: 'Arun' }] })

      expect(await getHiddenPlayersAction()).toEqual({
        status: 'ok',
        data: [{ id: 3, name: 'Arun' }],
      })
      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hasPublishConsent: { not_equals: true } } }),
      )
    })

    it('reports a failure to load', async () => {
      payload.find.mockRejectedValue(new Error('database down'))

      expect(await getHiddenPlayersAction()).toEqual({ status: 'error' })
    })
  })
})
