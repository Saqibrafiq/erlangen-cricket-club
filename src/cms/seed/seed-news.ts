import type { Payload } from 'payload'

import { SEED_NEWS } from './data/news'
import { SEED_CONTEXT, upsertImage } from './media'
import { toRichText } from './rich-text'
import type { SeedNewsArticle } from './types'

const NEWS_ASSETS = 'news'
// Payload stores day-only dates at noon UTC so they never shift across time zones.
const DAY_ONLY_TIME = 'T12:00:00.000Z'

async function createArticleIfMissing(
  payload: Payload,
  article: SeedNewsArticle,
): Promise<boolean> {
  const existing = await payload.count({
    collection: 'news',
    where: { slug: { equals: article.slug } },
  })

  if (existing.totalDocs > 0) {
    return false
  }

  const featuredImage = article.featuredImage
    ? await upsertImage(payload, NEWS_ASSETS, article.featuredImage)
    : null
  const gallery: number[] = []
  for (const image of article.gallery) {
    gallery.push(await upsertImage(payload, NEWS_ASSETS, image))
  }

  await payload.create({
    collection: 'news',
    context: SEED_CONTEXT,
    data: {
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      publishedAt: `${article.publishedAt}${DAY_ONLY_TIME}`,
      featuredImage,
      featuredImageStyle: article.featuredImageStyle,
      gallery,
      body: toRichText(article.body),
      _status: 'published',
    },
  })

  return true
}

/** Imports the news articles migrated from the old website. Existing articles are left untouched. */
export async function seedNews(payload: Payload): Promise<void> {
  let created = 0
  for (const article of SEED_NEWS) {
    if (await createArticleIfMissing(payload, article)) {
      created += 1
    }
  }

  payload.logger.info(
    `News: ${created} articles created, ${SEED_NEWS.length - created} already present.`,
  )
}
