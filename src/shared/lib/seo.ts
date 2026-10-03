import type { Metadata } from 'next'

import { getLocalizedPath, routing, type Locale } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'

export const TITLE_TEMPLATE = `%s | ${siteConfig.name}`

const X_DEFAULT = 'x-default'

/** Canonical URL plus hreflang alternates for every locale. Paths are resolved against `metadataBase`. */
export function buildAlternates(
  pathname: string,
  locale: Locale,
): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((alternateLocale) => [
      alternateLocale,
      getLocalizedPath(pathname, alternateLocale),
    ]),
  )
  languages[X_DEFAULT] = getLocalizedPath(pathname, routing.defaultLocale)

  return {
    canonical: getLocalizedPath(pathname, locale),
    languages,
  }
}

export type BreadcrumbEntry = {
  name: string
  /** Unlocalised path, e.g. "/fixtures". */
  pathname: string
}

/** schema.org `BreadcrumbList` with absolute, localised URLs. */
export function buildBreadcrumbJsonLd(entries: readonly BreadcrumbEntry[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: `${siteConfig.url}${getLocalizedPath(entry.pathname, locale)}`,
    })),
  }
}

/** schema.org `SportsOrganization` describing the club, rendered site-wide as JSON-LD. */
export function buildSportsOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    sport: 'Cricket',
    url: siteConfig.url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.countryCode,
    },
  } as const
}
