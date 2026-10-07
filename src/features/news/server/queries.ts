import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/routing'

import type { NewsArticle, NewsSummary } from '../types'
import { mapNewsArticle, mapNewsSummary } from './map-news'

// The Local API bypasses access control, so public queries filter drafts out explicitly.
const PUBLISHED: Where = { _status: { equals: 'published' } }
// Populates featured image and gallery.
const WITH_IMAGES = 1

/** Published articles, newest first, in `locale` (falling back to English). */
export async function getNewsList(locale: Locale): Promise<NewsSummary[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: PUBLISHED,
    sort: '-publishedAt',
    locale,
    depth: WITH_IMAGES,
    pagination: false,
  })

  return docs.map(mapNewsSummary)
}

/**
 * One published article, or `null` if none has this slug.
 * Cached per request: the layout, metadata and page all call it.
 */
export const getNewsArticle = cache(async function getNewsArticle(
  slug: string,
  locale: Locale,
): Promise<NewsArticle | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    locale,
    depth: WITH_IMAGES,
    limit: 1,
  })
  const doc = docs[0]

  return doc ? mapNewsArticle(doc) : null
})

/** Slugs and last edits of all published articles, for static params and the sitemap. */
export async function getNewsEntries(): Promise<{ slug: string; updatedAt: string }[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    where: PUBLISHED,
    depth: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
  })

  return docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
}
