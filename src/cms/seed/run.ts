import { getPayload } from 'payload'

import config from '../../payload.config'
import { seed } from './seed'

// Entry point for `pnpm db:seed` (runs via `payload run`).
const payload = await getPayload({ config })

try {
  await seed(payload)
} finally {
  await payload.destroy()
}
