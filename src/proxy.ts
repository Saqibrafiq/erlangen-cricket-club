import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Skip Payload (admin, api), Next internals and any path with a file extension.
  matcher: '/((?!admin|api|_next|_vercel|.*\\..*).*)',
}
