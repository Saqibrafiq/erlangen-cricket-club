import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Skip Payload (admin, api), Next internals, share images (served at their locale path as
  // linked, without a redirect for crawlers) and any path with a file extension.
  matcher: '/((?!admin|api|_next|_vercel|.*opengraph-image|.*\\..*).*)',
}
