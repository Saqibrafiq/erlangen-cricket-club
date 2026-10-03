import type { MetadataRoute } from 'next'

import { FIXTURES_PATH, getCompetitionPath, getCompetitionSlugs } from '@/features/fixtures'
import { LEGAL_PATHS } from '@/features/legal'
import { getLocalizedPath, routing } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'

const STATIC_PATHS = ['/', FIXTURES_PATH, LEGAL_PATHS.impressum, LEGAL_PATHS.privacy] as const

function toEntry(pathname: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteConfig.url}${getLocalizedPath(pathname, routing.defaultLocale)}`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          locale,
          `${siteConfig.url}${getLocalizedPath(pathname, locale)}`,
        ]),
      ),
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const competitionSlugs = await getCompetitionSlugs()

  return [...STATIC_PATHS, ...competitionSlugs.map(getCompetitionPath)].map(toEntry)
}
