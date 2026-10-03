import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import type en from './messages/en.json'
import { routing } from './routing'

// eslint-disable-next-line @typescript-eslint/no-deprecated -- next/root-params cannot see [locale] next to Payload's root layout; see ADR-0002.
export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale

  const messages = (await import(`./messages/${locale}.json`)) as { default: typeof en }

  return { locale, messages: messages.default }
})
