import { ImageResponse } from 'next/og'
import { getFormatter, getTranslations } from 'next-intl/server'
import type { JSX } from 'react'

import { getContactInfo } from '@/features/contact'
import {
  describeResult,
  type FixtureSummary,
  formatGround,
  getFixture,
  getVenueKind,
} from '@/features/fixtures'
import { getPlayer, type Player } from '@/features/players'
import { type Locale, TIME_ZONE } from '@/i18n/routing'
import { siteConfig } from '@/shared/config/site'
import { loadBrandImageAssets, loadPhotoAsPng } from '@/shared/lib/brand-image-assets'

import {
  type GraphicTeam,
  MatchGraphicBody,
  ResultGraphicBody,
} from '../components/fixture-graphics'
import { GraphicFrame } from '../components/graphic-frame'
import { PlayerGraphicBody } from '../components/player-graphic'
import { getInstagramHandle } from '../domain/handle'
import type { GraphicRequest } from '@/shared/lib/instagram-graphic'
import { GRAPHIC_SIZE } from '../palette'

type GraphicContent = {
  label: string
  body: JSX.Element
}

function scoreOf(fixture: FixtureSummary, teamId: number): string | undefined {
  const innings = fixture.innings.find((entry) => entry.battingTeamId === teamId)
  return innings && `${String(innings.runs)}/${String(innings.wickets)}`
}

async function renderFixture(
  kind: 'match' | 'result',
  fixture: FixtureSummary,
  locale: Locale,
): Promise<GraphicContent | null> {
  const [t, tNext, tResult, tOutcome, format] = await Promise.all([
    getTranslations({ locale, namespace: 'instagram' }),
    getTranslations({ locale, namespace: 'home.nextMatch' }),
    getTranslations({ locale, namespace: 'fixtures.result' }),
    getTranslations({ locale, namespace: 'fixtures.outcome' }),
    getFormatter({ locale }),
  ])
  const date = format.dateTime(new Date(fixture.date), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: TIME_ZONE,
  })
  const toTeam = (team: FixtureSummary['teams'][number]): GraphicTeam => ({
    name: team.name,
    isClubTeam: team.isClubTeam,
    ...(kind === 'result' ? { score: scoreOf(fixture, team.id) } : {}),
  })
  const teams = [toTeam(fixture.teams[0]), toTeam(fixture.teams[1])] as const

  if (kind === 'match') {
    const venueKind = getVenueKind(formatGround(fixture.ground))
    return {
      label: t('match'),
      body: (
        <MatchGraphicBody
          competition={fixture.competition.name}
          teams={teams}
          versus={tNext('versus')}
          venueKind={venueKind && tNext(venueKind)}
          date={date}
          time={fixture.startTime && tNext('kickoff', { time: fixture.startTime })}
          venue={fixture.ground?.name ?? null}
        />
      ),
    }
  }

  if (!fixture.result) {
    return null
  }
  return {
    label: t('result'),
    body: (
      <ResultGraphicBody
        competition={fixture.competition.name}
        date={date}
        teams={teams}
        result={describeResult(fixture.result, fixture.teams, tResult)}
        outcome={fixture.clubOutcome && tOutcome(fixture.clubOutcome)}
        hasClubWon={fixture.clubOutcome === 'won'}
      />
    ),
  }
}

async function renderPlayer(
  player: Player,
  locale: Locale,
  origin: string,
): Promise<GraphicContent> {
  const [t, tPlayers] = await Promise.all([
    getTranslations({ locale, namespace: 'instagram' }),
    getTranslations({ locale, namespace: 'players' }),
  ])
  const words = player.name.trim().split(/\s+/)
  const lastName = words.pop() ?? player.name
  const role = player.clubOffice
    ? tPlayers(`office.${player.clubOffice}`)
    : player.playingRole && tPlayers(`playingRole.${player.playingRole}`)

  return {
    label: t('player'),
    body: (
      <PlayerGraphicBody
        firstName={words.length > 0 ? words.join(' ') : null}
        lastName={lastName}
        role={role}
        photoSrc={player.photo ? await loadPhotoAsPng(player.photo.url, origin) : null}
        initials={`${player.name.charAt(0)}${words.length > 0 ? lastName.charAt(0) : ''}`}
      />
    ),
  }
}

async function renderContent(
  request: GraphicRequest,
  locale: Locale,
  origin: string,
): Promise<GraphicContent | null> {
  if (request.kind === 'player') {
    const player = await getPlayer(request.slug, locale)
    return player && renderPlayer(player, locale, origin)
  }

  const fixture = await getFixture(request.fixtureId)
  const isClubFixture = fixture?.teams.some((team) => team.isClubTeam) ?? false
  return fixture && isClubFixture ? renderFixture(request.kind, fixture, locale) : null
}

/**
 * An Instagram post (1080×1350 PNG) for a club fixture or a player with consent, or `null` when
 * there is nothing to show (unknown id, not a club fixture, no result yet).
 */
export async function renderGraphic(
  request: GraphicRequest,
  locale: Locale,
  origin: string,
): Promise<ImageResponse | null> {
  const content = await renderContent(request, locale, origin)
  if (!content) {
    return null
  }

  const [{ crestSrc, fonts }, contact] = await Promise.all([
    loadBrandImageAssets(),
    getContactInfo(locale),
  ])
  const handle = contact.instagramUrl ? getInstagramHandle(contact.instagramUrl) : null

  return new ImageResponse(
    <GraphicFrame
      crestSrc={crestSrc}
      clubName={siteConfig.name}
      label={content.label}
      footer={handle ?? new URL(siteConfig.url).hostname}
    >
      {content.body}
    </GraphicFrame>,
    { ...GRAPHIC_SIZE, fonts },
  )
}
