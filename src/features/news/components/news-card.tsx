import { ArrowRight } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { getNewsPath } from '../paths'
import type { NewsSummary } from '../types'
import { NewsCover } from './news-cover'

export type NewsCardProps = {
  article: NewsSummary
  /** The lead story at the top of the list: its image loads first. */
  isLead?: boolean
}

/** A news teaser; the title link covers the whole card. */
export function NewsCard({ article, isLead = false }: NewsCardProps) {
  const t = useTranslations('news')
  const format = useFormatter()

  return (
    <article
      // Container query: side-by-side layout whenever the card itself is wide.
      className="group @container relative h-full overflow-hidden rounded-2xl border border-border-default bg-surface-default shadow-sm transition-shadow duration-150 hover:shadow-md"
    >
      <div className="flex h-full flex-col @3xl:flex-row">
        <NewsCover
          image={article.image}
          imageStyle={article.imageStyle}
          // Up to half the row when the card is wide (image beside text), full width when stacked.
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={isLead}
          className="aspect-video shrink-0 @3xl:aspect-auto @3xl:w-1/2"
        />
        <div className="flex flex-1 flex-col gap-3 p-5 @3xl:justify-center @3xl:gap-4 @3xl:p-10">
          <time dateTime={article.publishedAt} className="text-sm text-text-muted">
            {format.dateTime(new Date(article.publishedAt), { dateStyle: 'long' })}
          </time>
          <h2 className="font-display text-2xl leading-tight font-bold tracking-tight text-balance @3xl:text-4xl">
            <Link
              href={getNewsPath(article.slug)}
              className="rounded-sm group-hover:text-brand-primary after:absolute after:inset-0 after:rounded-2xl"
            >
              {article.title}
            </Link>
          </h2>
          <p className="line-clamp-3 text-text-muted">{article.excerpt}</p>
          <span
            aria-hidden="true"
            className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-brand-primary"
          >
            {t('readMore')}
            <ArrowRight className="size-4 motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
