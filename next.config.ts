import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
    // Instagram posts on the home page: the optimizer fetches them server-side, so visitors never
    // connect to Meta (ADR-0011).
    remotePatterns: [
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
  },
  // The Instagram graphics read fonts and the crest from disk at request time.
  outputFileTracingIncludes: {
    '/instagram/[locale]/[file]': ['./src/shared/assets/**/*'],
  },
  experimental: {
    // Player photos are shrunk in the browser first (see resize-image.ts) and capped at 3 MB on the
    // server; this leaves room for the form around them, below Vercel's 4.5 MB request limit.
    serverActions: { bodySizeLimit: '4mb' },
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // Payload's admin sends signed-out editors (and sign-outs) to its own login; use the club's
  // instead. The query string (e.g. ?redirect=/admin/collections/news) is kept.
  redirects: () =>
    Promise.resolve([{ source: '/admin/login', destination: '/login', permanent: false }]),
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
