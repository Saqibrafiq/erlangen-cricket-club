import type { MetadataRoute } from 'next'

import { getLocalizedPath, routing } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'

// Static routes only for now; CMS-driven entries (players, stories, fixtures) join as features land.
const STATIC_PATHS = ['/'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map((pathname) => ({
    url: `${siteConfig.url}${getLocalizedPath(pathname, routing.defaultLocale)}`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          locale,
          `${siteConfig.url}${getLocalizedPath(pathname, locale)}`,
        ]),
      ),
    },
  }))
}
