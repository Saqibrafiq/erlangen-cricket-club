import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { useFormatter } from 'next-intl'

import type { NewsArticle } from '../types'
import { NewsGallery } from './news-gallery'

export type NewsArticleViewProps = {
  article: NewsArticle
}

/**
 * A full article: date, title, featured image (photo or sponsor logo), body and photo gallery.
 * The excerpt is for cards, search results and link previews; here it would repeat the opening.
 */
export function NewsArticleView({ article }: NewsArticleViewProps) {
  const format = useFormatter()
  const { image } = article

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <time dateTime={article.publishedAt} className="text-sm font-medium text-text-muted">
          {format.dateTime(new Date(article.publishedAt), { dateStyle: 'long' })}
        </time>
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
          {article.title}
        </h1>
      </header>

      {image &&
        (article.imageStyle === 'logo' ? (
          <div className="flex justify-center rounded-2xl border border-border-default bg-surface-logo p-8">
            <Image
              src={image.url}
              alt={image.alt}
              width={image.width}
              height={image.height}
              priority
              className="h-40 w-auto object-contain"
            />
          </div>
        ) : (
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 768px) 768px, 100vw"
            priority
            className="h-auto w-full rounded-2xl"
          />
        ))}

      <RichText data={article.body} className="rich-text" />

      <NewsGallery images={article.gallery} />
    </article>
  )
}
