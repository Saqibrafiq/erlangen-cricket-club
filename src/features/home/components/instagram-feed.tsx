import { Play } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import type { InstagramPost } from '@/features/instagram'
import { SocialIcon } from '@/shared/ui/social-icon'

import { HomeSection } from './home-section'

export type InstagramFeedProps = {
  posts: readonly InstagramPost[]
  profileUrl: string
  /** "@er_cricketclub" */
  handle: string | null
}

// 3 per row on phones, 6 on desktop: never wider than ~220px.
const TILE_SIZES = '(min-width: 1024px) 220px, (min-width: 640px) 30vw, 33vw'

/**
 * The latest Instagram posts as square tiles linking to Instagram. Images come through our own
 * image optimizer, so visitors do not connect to Meta until they click (ADR-0011).
 */
export function InstagramFeed({ posts, profileUrl, handle }: InstagramFeedProps) {
  const t = useTranslations('home.instagram')

  return (
    <HomeSection
      id="instagram-heading"
      description={handle ?? undefined}
      heading={t('heading')}
      more={{ label: t('follow'), href: profileUrl, isExternal: true }}
    >
      <ul className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:grid-cols-6">
        {posts.map((post) => (
          <li key={post.id}>
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-xl bg-surface-muted sm:rounded-2xl"
            >
              <Image
                src={post.imageUrl}
                alt={post.caption ? post.caption.slice(0, 120) : t('postAlt')}
                fill
                sizes={TILE_SIZES}
                className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-media-overlay/50 text-text-on-media opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <SocialIcon network="instagram" className="size-8" />
              </span>
              {post.isVideo && (
                <Play
                  aria-hidden="true"
                  className="absolute top-2 right-2 size-5 fill-text-on-media text-text-on-media drop-shadow"
                />
              )}
              <span className="sr-only">{t('opensInNewTab')}</span>
            </a>
          </li>
        ))}
      </ul>
    </HomeSection>
  )
}
