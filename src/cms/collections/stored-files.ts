import type { CollectionConfig } from 'payload'

import { STORED_FILES_SLUG } from '../storage/database-storage'

const nobody = () => false

/**
 * Room for an upload's bytes as base64 (a third larger than the file): uploads are scaled to at
 * most 1600 px first, so a few MB at most. Payload's default text limit (40,000) is far too small.
 */
const MAX_BASE64_LENGTH = 8 * 1024 * 1024

/**
 * The bytes of privately stored uploads (ADR-0025), written and read only by the database storage
 * adapter through the Local API. Not reachable over the API and hidden in the admin panel.
 */
export const storedFiles: CollectionConfig = {
  slug: STORED_FILES_SLUG,
  admin: { hidden: true },
  access: { read: nobody, create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'mimeType', type: 'text', required: true },
    { name: 'filesize', type: 'number', required: true },
    { name: 'data', type: 'textarea', required: true, maxLength: MAX_BASE64_LENGTH },
  ],
}
