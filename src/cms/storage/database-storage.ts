import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import type { PayloadRequest } from 'payload'

/** The hidden collection that holds the bytes of privately stored uploads. */
export const STORED_FILES_SLUG = 'stored-files'

/** Uploads are namespaced by collection, so two collections can hold the same file name. */
export function toStorageKey(collection: string, filename: string): string {
  return `${collection}/${filename}`
}

async function findStoredFile(req: PayloadRequest, key: string) {
  const { docs } = await req.payload.find({
    collection: STORED_FILES_SLUG,
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return docs[0] ?? null
}

/**
 * Keeps an upload collection's files in the club's own database instead of public Blob storage
 * (ADR-0025): personal images such as Spielerpass cards never get a public address. Payload checks
 * the collection's read access before `staticHandler` serves a file.
 */
export const databaseStorage: Adapter = ({ collection }) => ({
  name: 'database',
  async handleUpload({ file, req }) {
    await req.payload.create({
      collection: STORED_FILES_SLUG,
      data: {
        key: toStorageKey(collection.slug, file.filename),
        mimeType: file.mimeType,
        filesize: file.filesize,
        data: file.buffer.toString('base64'),
      },
      overrideAccess: true,
      req,
    })
  },
  async handleDelete({ filename, req }) {
    await req.payload.delete({
      collection: STORED_FILES_SLUG,
      where: { key: { equals: toStorageKey(collection.slug, filename) } },
      overrideAccess: true,
      req,
    })
  },
  async staticHandler(req, { params }) {
    const stored = await findStoredFile(req, toStorageKey(collection.slug, params.filename))
    if (!stored) return new Response(null, { status: 404 })
    const bytes = Buffer.from(stored.data, 'base64')
    return new Response(bytes, {
      headers: {
        'Content-Type': stored.mimeType,
        'Content-Length': String(bytes.byteLength),
        // Personal data: never kept by shared caches.
        'Cache-Control': 'private, no-store',
      },
    })
  },
})
