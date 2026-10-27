import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import {
  getStandingsOverview,
  getStandingsSeasonPath,
  STANDINGS_EDITING,
  STANDINGS_PATH,
  StandingsEditingProvider,
  StandingsSeasonView,
} from '@/features/standings'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates } from '@/shared/lib/seo'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { Container } from '@/shared/ui/container'

type SeasonStandingsPageProps = PageProps<'/[locale]/standings/season/[season]'>

/** Past seasons only: the current one is the standings page itself. */
export async function generateStaticParams() {
  const { seasons } = await getStandingsOverview()
  return seasons.slice(1).map((season) => ({ season }))
}

async function loadSeason(params: SeasonStandingsPageProps['params']) {
  const [locale, { season }] = await Promise.all([resolveLocale(params), params])
  const standings = await getStandingsOverview(season)

  // Unknown seasons, and the current one (whose address is /standings), don't exist here.
  if (!standings.season || standings.isCurrent) {
    notFound()
  }
  return { locale, standings, season: standings.season }
}

export async function generateMetadata({ params }: SeasonStandingsPageProps): Promise<Metadata> {
  const { locale, season } = await loadSeason(params)
  const t = await getTranslations({ locale, namespace: 'standings' })
  const title = t('seasonTitle', { season })
  const description = t('seasonMetaDescription', { season })

  return {
    title,
    description,
    alternates: buildAlternates(getStandingsSeasonPath(season), locale),
    openGraph: { title, description },
  }
}

export default async function SeasonStandingsPage({ params }: SeasonStandingsPageProps) {
  const { locale, standings, season } = await loadSeason(params)
  const [t, tNavigation] = await Promise.all([
    getTranslations({ locale, namespace: 'standings' }),
    getTranslations({ locale, namespace: 'navigation' }),
  ])

  return (
    <Container className="space-y-8 py-10">
      <Breadcrumbs
        items={[{ label: tNavigation('standings'), href: STANDINGS_PATH }, { label: season }]}
      />
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t('seasonTitle', { season })}
      </h1>
      <StandingsEditingProvider editing={STANDINGS_EDITING}>
        <StandingsSeasonView standings={standings} />
      </StandingsEditingProvider>
    </Container>
  )
}
