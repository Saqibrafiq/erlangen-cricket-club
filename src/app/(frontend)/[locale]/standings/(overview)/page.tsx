import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getStandingsOverview, STANDINGS_PATH, StandingsOverview } from '@/features/standings'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/standings'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'standings' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildAlternates(STANDINGS_PATH, locale),
    openGraph: { title: t('title'), description: t('metaDescription') },
  }
}

export default async function StandingsPage({ params }: PageProps<'/[locale]/standings'>) {
  const locale = await resolveLocale(params)
  const [t, competitions] = await Promise.all([
    getTranslations({ locale, namespace: 'standings' }),
    getStandingsOverview(),
  ])

  return (
    <Container className="space-y-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
      <StandingsOverview competitions={competitions} />
    </Container>
  )
}
