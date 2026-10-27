import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deleteNewsAction,
  getDraftNewsAction,
  getNewsArticleForEditingAction,
  saveNewsAction,
  uploadNewsImageAction,
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

const BODY = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [
          { type: 'text', text: 'Tickets at ', version: 1 },
          {
            type: 'link',
            url: 'https://example.com',
            target: '_blank',
            rel: 'noopener noreferrer',
            title: null,
            version: 1,
            children: [{ type: 'text', text: 'example', version: 1 }],
          },
        ],
      },
    ],
  },
}

function formData(fields: Record<string, string | string[] | File>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      data.append(key, item)
    }
  }
  return data
}

const VALID = {
  title: 'Season Opener',
  excerpt: 'First match on Saturday.',
  publishedAt: '2026-10-20',
  body: JSON.stringify(BODY),
  status: 'published',
  locale: 'en',
}

describe('news editing actions', () => {
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

  it('change nothing without a session', async () => {
    payload.auth.mockResolvedValue({ user: null })

    expect(await saveNewsAction(formData(VALID))).toEqual({ status: 'unauthorized' })
    expect(await deleteNewsAction(1)).toEqual({ status: 'unauthorized' })
    expect(await getNewsArticleForEditingAction(1, 'en')).toEqual({ status: 'unauthorized' })
    expect(await getDraftNewsAction()).toEqual({ status: 'unauthorized' })
    expect(await uploadNewsImageAction(formData({}))).toEqual({ status: 'unauthorized' })
    expect(payload.create).not.toHaveBeenCalled()
  })

  describe('saveNewsAction', () => {
    it('creates a new article in both languages, with a stable URL and Payload-shaped links', async () => {
      payload.create.mockResolvedValue({ id: 9, slug: 'season-opener' })
      payload.update.mockResolvedValue({ id: 9, slug: 'season-opener' })

      const result = await saveNewsAction(formData({ ...VALID, locale: 'de' }))

      expect(result).toEqual({
        status: 'saved',
        article: { id: 9, slug: 'season-opener', isPublished: true },
      })
      const created = payload.create.mock.calls[0]?.[0] as Record<string, unknown>
      expect(created).toMatchObject({
        collection: 'news',
        locale: 'de',
        draft: false,
        ...AS_EDITOR,
        data: { slug: 'season-opener', _status: 'published', title: 'Season Opener' },
      })
      expect(JSON.stringify(created.data)).toContain('"fields":{"linkType":"custom"')
      expect(payload.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 9, locale: 'en', data: created.data }),
      )
    })

    it('saves a draft that visitors do not see', async () => {
      payload.create.mockResolvedValue({ id: 9, slug: 'season-opener' })
      payload.update.mockResolvedValue({ id: 9, slug: 'season-opener' })

      const result = await saveNewsAction(formData({ ...VALID, status: 'draft' }))

      expect(result).toMatchObject({ article: { isPublished: false } })
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          draft: true,
          data: expect.objectContaining({ _status: 'draft' }) as unknown,
        }),
      )
    })

    it('updates only the language being edited, keeping the URL', async () => {
      payload.update.mockResolvedValue({ id: 4, slug: 'old-title' })

      await saveNewsAction(formData({ ...VALID, id: '4', title: 'New title' }))

      expect(payload.update).toHaveBeenCalledOnce()
      const call = payload.update.mock.calls[0]?.[0] as { data: Record<string, unknown> }
      expect(call).toMatchObject({ id: 4, locale: 'en', ...AS_EDITOR })
      expect(call.data).not.toHaveProperty('slug')
      expect(call.data).toHaveProperty('body')
    })

    it('keeps the stored text when the form sends none', async () => {
      payload.update.mockResolvedValue({ id: 4, slug: 'old-title' })
      const { body: _body, ...withoutBody } = VALID

      await saveNewsAction(formData({ ...withoutBody, id: '4' }))

      const call = payload.update.mock.calls[0]?.[0] as { data: Record<string, unknown> }
      expect(call.data).not.toHaveProperty('body')
    })

    it('requires text for a new article', async () => {
      const { body: _body, ...withoutBody } = VALID

      expect(await saveNewsAction(formData(withoutBody))).toEqual({
        status: 'invalid',
        fieldErrors: { body: 'required' },
      })
      expect(payload.create).not.toHaveBeenCalled()
    })

    it('returns field errors, a duplicate title, or a server error', async () => {
      expect(await saveNewsAction(formData({ ...VALID, title: '' }))).toMatchObject({
        status: 'invalid',
        fieldErrors: { title: 'required' },
      })

      payload.create.mockRejectedValueOnce(new mocks.ValidationError(['slug']))
      expect(await saveNewsAction(formData(VALID))).toEqual({
        status: 'invalid',
        fieldErrors: { title: 'duplicateTitle' },
      })

      payload.create.mockRejectedValueOnce(new Error('database down'))
      expect(await saveNewsAction(formData(VALID))).toEqual({ status: 'error' })
      expect(payload.logger.error).toHaveBeenCalled()
    })
  })

  describe('uploadNewsImageAction', () => {
    const image = new File([new Uint8Array(8)], 'photo.webp', { type: 'image/webp' })

    it('uploads an image named after the article and returns it for the editor', async () => {
      payload.create.mockResolvedValue({
        id: 30,
        url: '/api/media/file/news-season-opener.webp',
        alt: 'Season Opener',
        width: 1200,
        height: 800,
      })

      const result = await uploadNewsImageAction(
        formData({ image, alt: ' Season Opener ', locale: 'de' }),
      )

      expect(result).toEqual({
        status: 'ok',
        image: {
          id: 30,
          url: '/api/media/file/news-season-opener.webp',
          alt: 'Season Opener',
          width: 1200,
          height: 800,
        },
      })
      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'media',
          data: { alt: 'Season Opener' },
          file: expect.objectContaining({ name: 'news-season-opener.webp' }) as unknown,
          locale: 'de',
          ...AS_EDITOR,
        }),
      )
    })

    it('falls back to the club name as description', async () => {
      payload.create.mockResolvedValue({ id: 30, url: '/x.webp', alt: '', width: 1, height: 1 })

      await uploadNewsImageAction(formData({ image }))

      expect(payload.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { alt: 'Erlangen Cricket Club' } }),
      )
    })

    it('rejects missing, wrong or oversized files before uploading', async () => {
      expect(await uploadNewsImageAction(formData({}))).toEqual({
        status: 'invalid',
        reason: 'type',
      })
      expect(
        await uploadNewsImageAction(
          formData({ image: new File(['x'], 'a.gif', { type: 'image/gif' }) }),
        ),
      ).toEqual({ status: 'invalid', reason: 'type' })
      expect(
        await uploadNewsImageAction(
          formData({
            image: new File([new Uint8Array(4 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' }),
          }),
        ),
      ).toEqual({ status: 'invalid', reason: 'size' })
      expect(payload.create).not.toHaveBeenCalled()
    })

    it('reports a failed upload or a file without dimensions', async () => {
      payload.create.mockRejectedValueOnce(new Error('storage down'))
      expect(await uploadNewsImageAction(formData({ image }))).toEqual({ status: 'error' })

      payload.create.mockResolvedValueOnce({ id: 31, url: null })
      expect(await uploadNewsImageAction(formData({ image }))).toEqual({ status: 'error' })
    })
  })

  describe('reading for the editor', () => {
    it('loads the newest version of an article, drafts included', async () => {
      payload.findByID.mockResolvedValue({
        id: 4,
        slug: 'season-review',
        title: 'Season review',
        excerpt: 'A good year.',
        body: BODY,
        publishedAt: '2026-10-12T12:00:00.000Z',
        featuredImage: null,
        featuredImageStyle: 'photo',
        gallery: [],
        _status: 'draft',
      })

      const result = await getNewsArticleForEditingAction(4, 'de')

      expect(result).toMatchObject({
        status: 'ok',
        data: { id: 4, publishedAt: '2026-10-12', status: 'draft' },
      })
      expect(payload.findByID).toHaveBeenCalledWith(
        expect.objectContaining({ id: 4, draft: true, locale: 'de', ...AS_EDITOR }),
      )
    })

    it('lists drafts for editors', async () => {
      payload.find.mockResolvedValue({ docs: [{ id: 5, title: 'Next season' }] })

      expect(await getDraftNewsAction()).toEqual({
        status: 'ok',
        data: [{ id: 5, title: 'Next season' }],
      })
      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { _status: { equals: 'draft' } }, draft: true }),
      )
    })

    it('refuses invalid ids and reports failures', async () => {
      expect(await getNewsArticleForEditingAction(0, 'en')).toEqual({ status: 'error' })

      payload.findByID.mockRejectedValue(new Error('not found'))
      expect(await getNewsArticleForEditingAction(4, 'en')).toEqual({ status: 'error' })

      payload.find.mockRejectedValue(new Error('database down'))
      expect(await getDraftNewsAction()).toEqual({ status: 'error' })
    })
  })

  describe('deleteNewsAction', () => {
    it('deletes the article as the editor', async () => {
      payload.delete.mockResolvedValue({ id: 4 })

      expect(await deleteNewsAction(4)).toEqual({ status: 'deleted' })
      expect(payload.delete).toHaveBeenCalledWith({ collection: 'news', id: 4, ...AS_EDITOR })
    })

    it('refuses invalid ids and reports failures', async () => {
      expect(await deleteNewsAction(-2)).toEqual({ status: 'error' })

      payload.delete.mockRejectedValue(new Error('not found'))
      expect(await deleteNewsAction(4)).toEqual({ status: 'error' })
    })
  })
})
