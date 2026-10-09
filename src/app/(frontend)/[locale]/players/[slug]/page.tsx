import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import {
  buildPlayerJsonLd,
  getPlayer,
  getPlayerEntries,
  getPlayerPath,
  getPlayers,
  pickTeammates,
  PlayerProfileView,
  PLAYERS_PATH,
} from '@/features/players'
import { resolveLocale } from '@/i18n/locale'
import { getLocalizedPath } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'
import { buildAlternates, buildBreadcrumbJsonLd } from '@/shared/lib/seo'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { Container } from '@/shared/ui/container'
import { JsonLd } from '@/shared/ui/json-ld'

type PlayerProfilePageProps = PageProps<'/[locale]/players/[slug]'>

// One row of cards on desktop.
const TEAMMATES_SHOWN = 4

export async function generateStaticParams() {
  const entries = await getPlayerEntries()
  return entries.map(({ slug }) => ({ slug }))
}

async function loadPlayer(params: PlayerProfilePageProps['params']) {
  const [locale, { slug }] = await Promise.all([resolveLocale(params), params])
  const player = await getPlayer(slug, locale)

  if (!player) {
    notFound()
  }

  return { locale, player }
}

export async function generateMetadata({ params }: PlayerProfilePageProps): Promise<Metadata> {
  const { locale, player } = await loadPlayer(params)
  const t = await getTranslations({ locale, namespace: 'players.profile' })
  const description = player.bio ?? t('metaDescription', { name: player.name })

  return {
    title: player.name,
    description,
    alternates: buildAlternates(getPlayerPath(player.slug), locale),
    openGraph: {
      type: 'profile',
      title: player.name,
      description,
      ...(player.photo ? { images: [{ url: player.photo.url, alt: player.photo.alt }] } : {}),
    },
  }
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { locale, player } = await loadPlayer(params)
  const squad = await getPlayers(locale)
  const tNavigation = await getTranslations({ locale, namespace: 'navigation' })
  const path = getPlayerPath(player.slug)
  const club = { name: siteConfig.name, url: siteConfig.url }

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <Breadcrumbs
          items={[{ label: tNavigation('players'), href: PLAYERS_PATH }, { label: player.name }]}
        />
        <PlayerProfileView
          player={player}
          teammates={pickTeammates(squad, player.slug, TEAMMATES_SHOWN)}
          playersHref={PLAYERS_PATH}
        />
      </div>
      <JsonLd
        data={buildPlayerJsonLd(player, `${siteConfig.url}${getLocalizedPath(path, locale)}`, club)}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: tNavigation('players'), pathname: PLAYERS_PATH },
            { name: player.name, pathname: path },
          ],
          locale,
        )}
      />
    </Container>
  )
}
