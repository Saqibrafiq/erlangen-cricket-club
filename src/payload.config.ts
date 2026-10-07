import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { competitions } from './cms/collections/competitions'
import { documents } from './cms/collections/documents'
import { fixtures } from './cms/collections/fixtures'
import { media } from './cms/collections/media'
import { contactMessages } from './cms/collections/contact-messages'
import { news } from './cms/collections/news'
import { teams } from './cms/collections/teams'
import { users } from './cms/collections/users'
import { contact } from './cms/globals/contact'
import { journey } from './cms/globals/journey'
import { impressum, privacyPolicy } from './cms/globals/legal-pages'
import { membership } from './cms/globals/membership'
import { migrations } from './cms/migrations'
import { routing } from './i18n/routing'
import { parseServerEnv } from './shared/config/env'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const env = parseServerEnv(process.env)

export default buildConfig({
  admin: {
    user: users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [news, fixtures, teams, competitions, media, documents, contactMessages, users],
  globals: [membership, contact, journey, impressum, privacyPolicy],
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
    migrationDir: path.resolve(dirname, 'cms/migrations'),
    // Schema changes always go through migrations, locally too, so dev and production never drift.
    push: false,
    // Applied on startup in production (Vercel has no separate release step).
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // Disabled locally without a token, so uploads go to ./media in development.
    vercelBlobStorage({
      enabled: env.BLOB_READ_WRITE_TOKEN !== undefined,
      collections: { [media.slug]: true, [documents.slug]: true },
      token: env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
