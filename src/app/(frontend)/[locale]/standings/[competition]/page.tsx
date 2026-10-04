import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getCompetitionPath, getCompetitionSlugs } from '@/features/fixtures'
import {
  CompetitionStandingsView,
  getCompetitionStandings,
  getStandingsPath,
  STANDINGS_PATH,
} from '@/features/standings'
import { Link } from '@/i18n/navigation'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates, buildBreadcrumbJsonLd } from '@/shared/lib/seo'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { Container } from '@/shared/ui/container'
import { JsonLd } from '@/shared/ui/json-ld'

type CompetitionStandingsPageProps = PageProps<'/[locale]/standings/[competition]'>

export async function generateStaticParams() {
  const slugs = await getCompetitionSlugs()
  return slugs.map((competition) => ({ competition }))
}

async function loadStandings(params: CompetitionStandingsPageProps['params']) {
  const [locale, { competition: slug }] = await Promise.all([resolveLocale(params), params])
  const standings = await getCompetitionStandings(slug)

  if (!standings) {
    notFound()
  }

  const { name, season } = standings.competition
  return { locale, standings, title: `${name} ${season}` }
}

export async function generateMetadata({
  params,
}: CompetitionStandingsPageProps): Promise<Metadata> {
  const { locale, standings, title } = await loadStandings(params)
  const t = await getTranslations({ locale, namespace: 'standings' })
  const description = t('competitionMetaDescription', { competition: title })

  return {
    title: `${t('title')}: ${title}`,
    description,
    alternates: buildAlternates(getStandingsPath(standings.competition.slug), locale),
    openGraph: { title: `${t('title')}: ${title}`, description },
  }
}

export default async function CompetitionStandingsPage({ params }: CompetitionStandingsPageProps) {
  const { locale, standings, title } = await loadStandings(params)
  const [t, tNavigation] = await Promise.all([
    getTranslations({ locale, namespace: 'standings' }),
    getTranslations({ locale, namespace: 'navigation' }),
  ])

  return (
    <Container className="space-y-6 py-10">
      <Breadcrumbs
        items={[{ label: tNavigation('standings'), href: STANDINGS_PATH }, { label: title }]}
      />
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <Link
          href={getCompetitionPath(standings.competition.slug)}
          className="inline-flex min-h-11 items-center gap-1 rounded-md text-sm font-medium text-brand-primary underline-offset-4 hover:underline"
        >
          {t('viewFixtures')}
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <CompetitionStandingsView standings={standings} caption={title} />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: tNavigation('standings'), pathname: STANDINGS_PATH },
            { name: title, pathname: getStandingsPath(standings.competition.slug) },
          ],
          locale,
        )}
      />
    </Container>
  )
}
