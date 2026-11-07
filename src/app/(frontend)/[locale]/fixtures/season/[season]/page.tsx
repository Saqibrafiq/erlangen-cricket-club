import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import {
  buildFixturesJsonLd,
  FIXTURE_EDITING,
  FIXTURES_PATH,
  FixturesEditingProvider,
  FixturesSeasonView,
  getFixturesOverview,
  getFixturesSeasonPath,
} from '@/features/fixtures'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { Container } from '@/shared/ui/container'
import { JsonLd } from '@/shared/ui/json-ld'

type SeasonFixturesPageProps = PageProps<'/[locale]/fixtures/season/[season]'>

/** Past seasons only: the current one is the fixtures page itself. */
export async function generateStaticParams() {
  const { seasons } = await getFixturesOverview()
  return seasons.slice(1).map((season) => ({ season }))
}

async function loadSeason(params: SeasonFixturesPageProps['params']) {
  const [locale, { season }] = await Promise.all([resolveLocale(params), params])
  const overview = await getFixturesOverview(season)

  // Unknown seasons, and the current one (whose address is /fixtures), don't exist here.
  if (!overview.season || overview.isCurrent) {
    notFound()
  }
  return { locale, overview, season: overview.season }
}

export async function generateMetadata({ params }: SeasonFixturesPageProps): Promise<Metadata> {
  const { locale, season } = await loadSeason(params)
  const t = await getTranslations({ locale, namespace: 'fixtures' })
  const title = t('seasonTitle', { season })
  const description = t('seasonMetaDescription', { season })

  return {
    title,
    description,
    alternates: buildAlternates(getFixturesSeasonPath(season), locale),
    openGraph: { title, description },
  }
}

export default async function SeasonFixturesPage({ params }: SeasonFixturesPageProps) {
  const { locale, overview, season } = await loadSeason(params)
  const [t, tNavigation] = await Promise.all([
    getTranslations({ locale, namespace: 'fixtures' }),
    getTranslations({ locale, namespace: 'navigation' }),
  ])

  return (
    <Container className="space-y-8 py-10">
      <Breadcrumbs
        items={[{ label: tNavigation('fixtures'), href: FIXTURES_PATH }, { label: season }]}
      />
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t('seasonTitle', { season })}
      </h1>
      <FixturesEditingProvider editing={FIXTURE_EDITING}>
        <FixturesSeasonView overview={overview} />
      </FixturesEditingProvider>
      <JsonLd data={buildFixturesJsonLd(overview.fixtures)} />
    </Container>
  )
}
