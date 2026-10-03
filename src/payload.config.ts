import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { media } from './cms/collections/media'
import { users } from './cms/collections/users'
import { routing } from './i18n/routing'
import { parseServerEnv } from './shared/config/env'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const env = parseServerEnv(process.env)

export default buildConfig({
  admin: {
    user: users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [users, media],
  editor: lexicalEditor(),
  // Content fields opt in with `localized: true`; untranslated German falls back to English.
  localization: {
    locales: [...routing.locales],
    defaultLocale: routing.defaultLocale,
    fallback: true,
  },
  graphQL: { disable: true },
  secret: env.PAYLOAD_SECRET,
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URI },
  }),
  sharp,
  plugins: [
    // Disabled locally without a token, so uploads go to ./media in development.
    vercelBlobStorage({
      enabled: env.BLOB_READ_WRITE_TOKEN !== undefined,
      collections: { [media.slug]: true },
      token: env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
