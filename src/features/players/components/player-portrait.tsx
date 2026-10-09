import Image from 'next/image'

import { cn } from '@/shared/lib/cn'

import { getInitials } from '../domain/players'
import type { Player } from '../types'

export type PlayerPortraitProps = {
  player: Pick<Player, 'name' | 'photo'>
  /** Rendered width for `next/image`, e.g. "256px". */
  sizes: string
  priority?: boolean
  /** In cards the name sits right next to the photo, so the photo needs no alt text. */
  isDecorative?: boolean
  className?: string
}

/**
 * Fills its positioned parent with the player standing on its bottom edge. Made for cut-out photos
 * (transparent background) on the club's green; a regular photo sits whole at the bottom. Without a
 * photo, the player's initials are shown instead.
 */
export function PlayerPortrait({
  player,
  sizes,
  priority = false,
  isDecorative = false,
  className,
}: PlayerPortraitProps) {
  if (!player.photo) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          '@container absolute inset-0 flex items-center justify-center font-display font-bold tracking-tight text-text-on-media/30',
          className,
        )}
      >
        {/* Scales with the space, from a card to the profile header. */}
        <span className="text-[45cqw] leading-none">{getInitials(player.name)}</span>
      </span>
    )
  }

  return (
    <Image
      src={player.photo.url}
      alt={isDecorative ? '' : player.photo.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn('object-contain object-bottom', className)}
    />
  )
}
