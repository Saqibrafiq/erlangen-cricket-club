import { existsSync } from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../../payload.config'
import { seed } from './seed'

// Payload's default upload folders (relative to the working directory).
const LOCAL_UPLOAD_DIRS = ['media', 'documents']

// Payload checks the local upload folders for name clashes even when files go to Blob storage, so
// seeding production from a dev machine would rename every upload ("logo-1.png") and the seed's
// lookups by filename would miss. Fail before anything is written.
const clashingDirs = LOCAL_UPLOAD_DIRS.filter((dir) => existsSync(path.resolve(dir)))
if (process.env.BLOB_READ_WRITE_TOKEN && clashingDirs.length > 0) {
  throw new Error(
    `Seeding with Blob storage, but local upload folders exist: ${clashingDirs.join(', ')}. ` +
      'Move them aside for this run (see docs/deployment.md, step 4).',
  )
}

// Entry point for `pnpm db:seed` (runs via `payload run`).
const payload = await getPayload({ config })

try {
  await seed(payload)
} finally {
  await payload.destroy()
}
