import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/shared/config/site'

import { hasPlayingDetails, splitName } from '../domain/players'
import type { Player } from '../types'
import { PlayerCard } from './player-card'
import { PlayerPortrait } from './player-portrait'

export type PlayerProfileViewProps = {
  player: Player
  /** Other players for the "More players" strip. */
  teammates: readonly Player[]
  playersHref: string
}

// Derived from scorecards once they are recorded (CLAUDE.md §4.1); shown empty until then.
const CAREER_STATS = ['matches', 'runs', 'wickets', 'catches'] as const

type StatTileProps = {
  label: string
  value: string
  /** Read instead of the value when it is only a placeholder. */
  srValue?: string
}

function StatTile({ label, value, srValue }: StatTileProps) {
  return (
    // Label first in the markup (as a description list requires); the value is shown on top.
    <div className="flex flex-col gap-1 rounded-2xl bg-surface-muted p-4 sm:p-5">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="order-first font-display text-2xl leading-tight font-bold sm:text-3xl">
        {srValue ? (
          <>
            <span aria-hidden="true" className="text-text-muted">
              {value}
            </span>
            <span className="sr-only">{srValue}</span>
          </>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function ProfileHeader({ player }: { player: Player }) {
  const t = useTranslations('players')
  const { firstName, lastName } = splitName(player.name)
  const tags = [
    player.clubOffice && t(`office.${player.clubOffice}`),
    player.playingRole && t(`playingRole.${player.playingRole}`),
    ...player.teams.map((team) => team.name),
  ].filter(Boolean)

  return (
    <header className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-brand-surface to-media-overlay text-text-on-media">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots-on-media" />
      <span
        aria-hidden="true"
        className="absolute -top-4 right-4 -z-10 origin-top-right font-display text-9xl leading-none font-bold tracking-tighter text-text-on-media/10 select-none lg:scale-150"
      >
        {siteConfig.shortName}
      </span>
      {/* A soft light behind the player. */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 -z-10 size-96 rounded-full bg-text-on-media/15 blur-3xl md:right-24"
      />
      <div className="grid md:grid-cols-2 md:items-end">
        {/* The player stands on the bottom edge of the header. */}
        <div className="relative mx-auto h-80 w-full max-w-sm sm:h-96 md:order-last md:h-112 md:max-w-none">
          <PlayerPortrait player={player} sizes="(min-width: 768px) 40vw, 384px" priority />
        </div>
        <div className="relative -mt-28 min-w-0 space-y-5 bg-linear-to-t from-media-overlay from-60% to-transparent p-6 pt-28 text-center sm:p-10 sm:pt-28 md:mt-0 md:bg-none md:pb-14 md:text-left">
          <h1>
            {firstName && (
              <span className="block text-lg font-semibold tracking-widest uppercase opacity-80 sm:text-2xl">
                {firstName}
              </span>
            )}{' '}
            <span className="block font-display text-5xl leading-none font-bold tracking-tight wrap-break-word uppercase sm:text-7xl lg:text-8xl">
              {lastName}
            </span>
          </h1>
          {tags.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2 md:justify-start">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-text-on-media/15 px-3 py-1 text-sm font-semibold ring-1 ring-text-on-media/20"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {player.bio && <p className="max-w-2xl text-lg opacity-90">{player.bio}</p>}
          <p className="text-sm font-semibold tracking-widest uppercase opacity-70">
            {t('profile.eyebrow')}
          </p>
        </div>
      </div>
    </header>
  )
}

/** A player's profile: header with photo and name, playing details, career stats, more players. */
export function PlayerProfileView({ player, teammates, playersHref }: PlayerProfileViewProps) {
  const t = useTranslations('players')

  return (
    <div className="space-y-10 sm:space-y-14">
      <article className="space-y-6">
        <ProfileHeader player={player} />

        {hasPlayingDetails(player) && (
          <section
            aria-labelledby="playing-profile-heading"
            className="rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm sm:p-8"
          >
            <h2 id="playing-profile-heading" className="text-2xl font-bold">
              {t('profile.details.heading')}
            </h2>
            <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {player.playingRole && (
                <StatTile
                  label={t('profile.details.role')}
                  value={t(`playingRole.${player.playingRole}`)}
                />
              )}
              {player.battingStyle && (
                <StatTile
                  label={t('profile.details.batting')}
                  value={t(`battingStyle.${player.battingStyle}`)}
                />
              )}
              {player.bowlingStyle && (
                <StatTile
                  label={t('profile.details.bowling')}
                  value={t(`bowlingStyle.${player.bowlingStyle}`)}
                />
              )}
            </dl>
          </section>
        )}

        <section
          aria-labelledby="career-stats-heading"
          className="rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="career-stats-heading" className="text-2xl font-bold">
              {t('profile.stats.heading')}
            </h2>
            <span className="rounded-full bg-surface-highlight px-3 py-1 text-xs font-semibold tracking-wide text-brand-primary uppercase">
              {t('profile.stats.eyebrow')}
            </span>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CAREER_STATS.map((stat) => (
              <StatTile
                key={stat}
                label={t(`profile.stats.${stat}`)}
                value="—"
                srValue={t('profile.stats.notRecorded')}
              />
            ))}
          </dl>
          <p className="mt-4 text-sm text-text-muted">{t('profile.stats.text')}</p>
        </section>
      </article>

      {teammates.length > 0 && (
        <section aria-labelledby="teammates-heading" className="space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 id="teammates-heading" className="text-2xl font-bold sm:text-3xl">
              {t('profile.teammates.heading')}
            </h2>
            <Link
              href={playersHref}
              className="inline-flex min-h-11 items-center font-semibold text-brand-primary underline-offset-4 hover:underline"
            >
              {t('profile.teammates.all')}
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {teammates.map((teammate) => (
              <li key={teammate.id}>
                <PlayerCard player={teammate} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
