import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getCompetitionNavigation } from '@/features/fixtures'
import { MEMBERSHIP_PATH } from '@/features/membership'
import {
  buildPlayersJsonLd,
  getPlayerPath,
  getPlayers,
  PLAYERS_PATH,
  PlayersView,
} from '@/features/players'
import { resolveLocale } from '@/i18n/locale'
import { getLocalizedPath } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'
import { buildAlternates } from '@/shared/lib/seo'
import { Container } from '@/shared/ui/container'
import { JsonLd } from '@/shared/ui/json-ld'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/players'>): Promise<Metadata> {
  const locale = await resolveLocale(params)
  const t = await getTranslations({ locale, namespace: 'players' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: buildAlternates(PLAYERS_PATH, locale),
    openGraph: { title: t('title'), description: t('metaDescription') },
  }
}

export default async function PlayersPage({ params }: PageProps<'/[locale]/players'>) {
  const locale = await resolveLocale(params)
  const [players, navigation] = await Promise.all([getPlayers(locale), getCompetitionNavigation()])
  const facts = navigation && {
    season: navigation.season,
    clubTeams: navigation.teams.length,
    competitions: navigation.teams.reduce((total, team) => total + team.competitions.length, 0),
  }

  return (
    <Container className="py-10">
      <PlayersView players={players} joinHref={MEMBERSHIP_PATH} facts={facts} />
      <JsonLd
        data={buildPlayersJsonLd(
          players,
          { name: siteConfig.name, url: siteConfig.url },
          (player) => `${siteConfig.url}${getLocalizedPath(getPlayerPath(player.slug), locale)}`,
        )}
      />
    </Container>
  )
}
