import type { Media, News } from '@/payload-types'

import { toDateInputValue } from '../domain/news-form'
import type { RichTextDocument } from '../domain/rich-text'
import type { EditorImage, NewsDraft } from '../editor-types'
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

/** A media document as an image the article editor can show and reference. */
export function toEditorImage(media: number | Media | null | undefined): EditorImage | null {
  const image = mapNewsImage(media)
  return image && typeof media === 'object' && media !== null ? { ...image, id: media.id } : null
}

/** Maps a news document (queried with depth >= 1, drafts included) to what the editor needs. */
export function mapNewsDraft(doc: News): NewsDraft {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    body: doc.body,
    publishedAt: toDateInputValue(doc.publishedAt),
    featuredImage: toEditorImage(doc.featuredImage),
    featuredImageStyle: doc.featuredImageStyle,
    gallery: (doc.gallery ?? [])
      .map(toEditorImage)
      .filter((image): image is EditorImage => image !== null),
    status: doc._status === 'draft' ? 'draft' : 'published',
  }
}

/** The editor's text in the exact shape Payload's generated `News['body']` type describes. */
export function toStoredBody(document: RichTextDocument): News['body'] {
  const { root } = document
  return {
    root: {
      ...root,
      type: 'root',
      children: (root.children ?? []).map((child) => ({
        ...child,
        version: typeof child.version === 'number' ? child.version : 1,
      })),
      direction: root.direction === 'rtl' ? 'rtl' : 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
