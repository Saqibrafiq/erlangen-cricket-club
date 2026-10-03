import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { routing, type Locale } from './routing'

/**
 * Narrows a route's `locale` param to a supported locale (404 otherwise) and
 * registers it for static rendering. Call at the top of every localized layout and page.
 */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-deprecated -- required for static rendering until next/root-params works here; see ADR-0002.
  setRequestLocale(locale)
  return locale
}
