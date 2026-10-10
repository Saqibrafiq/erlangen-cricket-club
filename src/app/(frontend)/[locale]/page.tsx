import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getHomeData, HOME_PATH, HomeView } from '@/features/home'
import { resolveLocale } from '@/i18n/locale'
import { siteConfig } from '@/shared/config/site'
import { buildAlternates } from '@/shared/lib/seo'

// Hourly, so a fixture that has been played moves out of "Next match" even without a CMS change.
export const revalidate = 3600

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: { absolute: siteConfig.name },
    description: t('siteDescription'),
    alternates: buildAlternates(HOME_PATH, locale),
    openGraph: { title: siteConfig.name, description: t('siteDescription') },
  }
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = await resolveLocale(params)
  const data = await getHomeData(locale, new Date())

  return <HomeView data={data} />
}
