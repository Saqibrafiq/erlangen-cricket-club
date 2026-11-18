import type { CollectionConfig, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { databaseStorage, STORED_FILES_SLUG, toStorageKey } from './database-storage'

function request(stored: object[] = []) {
  const payload = {
    create: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({})),
    find: vi.fn(() => Promise.resolve({ docs: stored })),
  }
  return { req: { payload } as unknown as PayloadRequest, payload }
}

const adapter = databaseStorage({ collection: { slug: 'spielerpass-cards' } as CollectionConfig })
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47])

describe('toStorageKey', () => {
  it('namespaces a file by its collection', () => {
    expect(toStorageKey('match-sheets', 'sheet.jpg')).toBe('match-sheets/sheet.jpg')
  })
})

describe('databaseStorage', () => {
  it('stores an upload in the database, as the system', async () => {
    const { req, payload } = request()

    await adapter.handleUpload({
      file: { buffer: PNG, filename: 'card.png', filesize: 4, mimeType: 'image/png' },
      req,
    } as never)

    expect(payload.create).toHaveBeenCalledWith({
      collection: STORED_FILES_SLUG,
      data: {
        key: 'spielerpass-cards/card.png',
        mimeType: 'image/png',
        filesize: 4,
        data: PNG.toString('base64'),
      },
      overrideAccess: true,
      req,
    })
  })

  it('deletes the stored bytes with the upload', async () => {
    const { req, payload } = request()

    await adapter.handleDelete({ filename: 'card.png', req } as never)

    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: STORED_FILES_SLUG,
        where: { key: { equals: 'spielerpass-cards/card.png' } },
        overrideAccess: true,
      }),
    )
  })

  it('serves a stored file privately, never cached by shared caches', async () => {
    const { req } = request([{ mimeType: 'image/png', data: PNG.toString('base64') }])

    const response = await adapter.staticHandler(req, {
      params: { collection: 'spielerpass-cards', filename: 'card.png' },
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(response.headers.get('Content-Length')).toBe('4')
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(Buffer.from(await response.arrayBuffer())).toEqual(PNG)
  })

  it('answers not found for a missing file', async () => {
    const { req } = request()

    const response = await adapter.staticHandler(req, {
      params: { collection: 'spielerpass-cards', filename: 'gone.png' },
    })

    expect(response.status).toBe(404)
  })
})
