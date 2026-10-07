import type { Media, News } from '@/payload-types'

import type { NewsArticle, NewsImage, NewsSummary } from '../types'

/** An uploaded image ready for `next/image`, or `null` if it is not populated or has no file. */
export function mapNewsImage(media: number | Media | null | undefined): NewsImage | null {
  if (typeof media !== 'object' || media === null) {
    return null
  }

  const { url, width, height, alt } = media
  if (!url || !width || !height) {
    return null
  }

  return { url, alt, width, height }
}

/** Maps a news document (queried with depth >= 1) to the card view model. */
export function mapNewsSummary(doc: News): NewsSummary {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    publishedAt: doc.publishedAt,
    image: mapNewsImage(doc.featuredImage),
    imageStyle: doc.featuredImageStyle,
  }
}

/** Maps a news document (queried with depth >= 1) to the article view model. */
export function mapNewsArticle(doc: News): NewsArticle {
  return {
    ...mapNewsSummary(doc),
    body: doc.body,
    gallery: (doc.gallery ?? [])
      .map(mapNewsImage)
      .filter((image): image is NewsImage => image !== null),
    updatedAt: doc.updatedAt,
  }
}
