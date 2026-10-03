import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFormatter, getTranslations } from 'next-intl/server'

import {
  buildFixturesJsonLd,
  CompetitionFixtures,
  FIXTURES_PATH,
  getCompetitionDetail,
  getCompetitionPath,
  getCompetitionSlugs,
} from '@/features/fixtures'
import { resolveLocale } from '@/i18n/locale'
import { buildAlternates, buildBreadcrumbJsonLd } from '@/shared/lib/seo'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { JsonLd } from '@/shared/ui/json-ld'
import { Container } from '@/shared/ui/container'

type CompetitionPageProps = PageProps<'/[locale]/fixtures/[competition]'>

export async function generateStaticParams() {
  const slugs = await getCompetitionSlugs()
  return slugs.map((competition) => ({ competition }))
}

async function loadCompetition(params: CompetitionPageProps['params']) {
  const [locale, { competition: slug }] = await Promise.all([resolveLocale(params), params])
  const detail = await getCompetitionDetail(slug)

  if (!detail) {
    notFound()
  }

  return { locale, detail, title: `${detail.competition.name} ${detail.competition.season}` }
}

export async function generateMetadata({ params }: CompetitionPageProps): Promise<Metadata> {
  const { locale, detail, title } = await loadCompetition(params)
  const [t, format] = await Promise.all([
    getTranslations({ locale, namespace: 'fixtures' }),
    getFormatter({ locale }),
  ])
  const description = t('competitionMetaDescription', {
    competition: title,
    teams: format.list(detail.clubTeams.map((team) => team.name)),
  })

  return {
    title,
    description,
    alternates: buildAlternates(getCompetitionPath(detail.competition.slug), locale),
    openGraph: { title, description },
  }
}

export default async function CompetitionPage({ params }: CompetitionPageProps) {
  const { locale, detail, title } = await loadCompetition(params)
  const tNavigation = await getTranslations({ locale, namespace: 'navigation' })
  const competitionPath = getCompetitionPath(detail.competition.slug)

  return (
    <Container className="space-y-6 py-10">
      <Breadcrumbs
        items={[{ label: tNavigation('fixtures'), href: FIXTURES_PATH }, { label: title }]}
      />
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <CompetitionFixtures detail={detail} />
      <JsonLd data={buildFixturesJsonLd(detail.fixtures)} />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: tNavigation('fixtures'), pathname: FIXTURES_PATH },
            { name: title, pathname: competitionPath },
          ],
          locale,
        )}
      />
    </Container>
  )
}
