import type { MetadataRoute } from 'next'

import { FIXTURES_PATH, getCompetitionPath, getCompetitionSlugs } from '@/features/fixtures'
import { CONTACT_PATH } from '@/features/contact'
import { LEGAL_PATHS } from '@/features/legal'
import { MEMBERSHIP_PATH } from '@/features/membership'
import { getNewsEntries, getNewsPath, NEWS_PATH } from '@/features/news'
import { getStandingsPath, STANDINGS_PATH } from '@/features/standings'
import { getLocalizedPath, routing } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'

const STATIC_PATHS = [
  '/',
  FIXTURES_PATH,
  STANDINGS_PATH,
  NEWS_PATH,
  MEMBERSHIP_PATH,
  CONTACT_PATH,
  LEGAL_PATHS.impressum,
  LEGAL_PATHS.privacy,
] as const

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
  const [competitionSlugs, newsEntries] = await Promise.all([
    getCompetitionSlugs(),
    getNewsEntries(),
  ])

  return [
    ...[
      ...STATIC_PATHS,
      ...competitionSlugs.map(getCompetitionPath),
      ...competitionSlugs.map(getStandingsPath),
    ].map(toEntry),
    ...newsEntries.map(({ slug, updatedAt }) => ({
      ...toEntry(getNewsPath(slug)),
      lastModified: updatedAt,
    })),
  ]
}
