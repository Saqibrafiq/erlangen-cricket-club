import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { siteConfig } from '@/shared/config/site'

import { splitName } from '../domain/players'
import { getPlayerPath } from '../paths'
import type { Player } from '../types'
import { PlayerPortrait } from './player-portrait'

export type PlayerCardProps = {
  player: Player
  /** Cards above the fold load their photo first. */
  priority?: boolean
}

// 3 columns on phones up to 8 on wide screens: never wider than ~180px.
const PHOTO_SIZES =
  '(min-width: 1280px) 150px, (min-width: 1024px) 180px, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw'

/**
 * A squad card: the player cut out on the club's green, first name above a bold surname, office
 * or role as a chip. The name link covers the whole card.
 */
export function PlayerCard({ player, priority = false }: PlayerCardProps) {
  const t = useTranslations('players')
  const { firstName, lastName } = splitName(player.name)
  const role = player.clubOffice
    ? t(`office.${player.clubOffice}`)
    : player.playingRole && t(`playingRole.${player.playingRole}`)

  return (
    <article className="group relative isolate aspect-3/4 overflow-hidden rounded-2xl bg-linear-to-b from-brand-surface to-media-overlay text-text-on-media shadow-sm transition-shadow duration-300 hover:shadow-xl has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring sm:rounded-3xl">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots-on-media" />
      <span
        aria-hidden="true"
        className="absolute top-1.5 left-2.5 -z-10 font-display text-4xl leading-none font-bold tracking-tighter text-text-on-media/15 select-none sm:text-5xl"
      >
        {siteConfig.shortName}
      </span>
      {/* A soft light behind the player's head. */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -z-10 size-3/4 -translate-x-1/2 -translate-y-1/4 rounded-full bg-text-on-media/15 blur-2xl"
      />
      <div className="absolute inset-x-0 top-4 bottom-0 -z-10">
        <PlayerPortrait
          player={player}
          sizes={PHOTO_SIZES}
          priority={priority}
          isDecorative
          className="origin-bottom motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
      </div>
      {/* Keeps the name readable over the shirt. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-media-overlay/95 via-media-overlay/60 to-transparent"
      />
      {role && (
        <p className="absolute top-2 right-2 rounded-full bg-media-overlay/50 px-2 py-0.5 text-2xs font-semibold backdrop-blur-sm sm:top-3 sm:right-3 sm:text-xs">
          {role}
        </p>
      )}
      <h3 className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4">
        <Link
          href={getPlayerPath(player.slug)}
          className="block after:absolute after:inset-0 focus-visible:outline-none"
        >
          {firstName && (
            <span className="block truncate text-2xs font-semibold tracking-widest uppercase opacity-80 sm:text-xs">
              {firstName}
            </span>
          )}{' '}
          <span className="block truncate font-display text-lg leading-none font-bold tracking-tight uppercase sm:text-xl">
            {lastName}
          </span>
        </Link>
      </h3>
    </article>
  )
}
