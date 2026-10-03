import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  // English keeps clean URLs ("/players"), German is prefixed ("/de/players").
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]

/** All dates and times are shown in the club's local time, on server and client alike. */
export const TIME_ZONE = 'Europe/Berlin'

/** Returns the public path of `pathname` for `locale`, following the `as-needed` prefix strategy. */
export function getLocalizedPath(pathname: string, locale: Locale): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (locale === routing.defaultLocale) {
    return normalizedPath
  }

  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`
}
