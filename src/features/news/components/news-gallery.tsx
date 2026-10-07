import Image from 'next/image'
import { useTranslations } from 'next-intl'

import type { NewsImage } from '../types'

export type NewsGalleryProps = {
  images: readonly NewsImage[]
}

/** The article's further photos; each opens in full size. Renders nothing without photos. */
export function NewsGallery({ images }: NewsGalleryProps) {
  const t = useTranslations('news')

  if (images.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="news-gallery-heading" className="space-y-4">
      <h2 id="news-gallery-heading" className="text-2xl font-bold tracking-tight">
        {t('gallery')}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <li key={image.url}>
            <a
              href={image.url}
              className="group relative block aspect-square overflow-hidden rounded-xl bg-surface-muted"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 256px, 50vw"
                className="object-cover motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:scale-105"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
