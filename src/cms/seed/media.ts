import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Payload } from 'payload'

import type { RevalidateContext } from '../hooks/revalidate-pages'
import type { SeedImage } from './types'

export const SEED_CONTEXT: RevalidateContext = { disableRevalidate: true }

const ASSETS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'assets')

/** Id of an image already in the media library (matched by filename), or `null`. */
export async function findMediaId(payload: Payload, filename: string): Promise<number | null> {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  return docs[0]?.id ?? null
}

/**
 * Uploads `seed/assets/<folder>/<file>` once; later runs reuse the existing media document
 * (matched by filename).
 */
export async function upsertImage(
  payload: Payload,
  folder: string,
  image: SeedImage,
): Promise<number> {
  const existingId = await findMediaId(payload, image.file)
  if (existingId !== null) {
    return existingId
  }

  const created = await payload.create({
    collection: 'media',
    data: { alt: image.alt },
    filePath: path.join(ASSETS_DIR, folder, image.file),
    context: SEED_CONTEXT,
  })
  return created.id
}
