import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import {
  buildFixturesJsonLd,
  FIXTURES_PATH,
  FixturesOverview,
  getFixturesOverview,
} from '@/features/fixtures'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { JsonLd } from '@/shared/ui/json-ld'
import { Container } from '@/shared/ui/container'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/fixtures'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'fixtures' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates(FIXTURES_PATH, locale),
    openGraph: { title: t('metaTitle'), description: t('metaDescription') },
  }
}

export default async function FixturesPage({ params }: PageProps<'/[locale]/fixtures'>) {
  const locale = await resolveLocale(params)
  const [t, overview] = await Promise.all([
    getTranslations({ locale, namespace: 'fixtures' }),
    getFixturesOverview(),
  ])

  return (
    <Container className="space-y-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('heading')}</h1>
      <FixturesOverview overview={overview} />
      <JsonLd data={buildFixturesJsonLd(overview.fixtures)} />
    </Container>
  )
}
