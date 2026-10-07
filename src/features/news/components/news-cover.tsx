import Image from 'next/image'

import { cn } from '@/shared/lib/cn'
import { TeamMonogram } from '@/shared/ui/team-monogram'

import type { NewsImage, NewsImageStyle } from '../types'

export type NewsCoverProps = {
  image: NewsImage | null
  imageStyle: NewsImageStyle
  /** `next/image` sizes hint for the rendered width. */
  sizes: string
  /** Sets the box, e.g. its aspect ratio; the image fills it. */
  className?: string
  priority?: boolean
}

/**
 * The article's featured image in a fixed box: photos fill it, logos are shown whole on a light
 * panel. Without an image, a club-branded panel keeps cards the same shape.
 */
export function NewsCover({ image, imageStyle, sizes, className, priority }: NewsCoverProps) {
  if (!image) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-linear-to-br from-surface-highlight to-surface-muted',
          className,
        )}
      >
        <TeamMonogram shortName="ECC" tone="club" size="lg" />
      </div>
    )
  }

  const isLogo = imageStyle === 'logo'

  return (
    <div className={cn('relative overflow-hidden', isLogo && 'bg-surface-logo', className)}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          isLogo ? 'object-contain p-8' : 'object-cover',
          'motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-105',
        )}
      />
    </div>
  )
}
