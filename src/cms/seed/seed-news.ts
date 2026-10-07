import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Payload } from 'payload'

import type { RevalidateContext } from '../hooks/revalidate-pages'
import { SEED_NEWS } from './data/news'
import { toRichText } from './rich-text'
import type { SeedImage, SeedNewsArticle } from './types'

const SEED_CONTEXT: RevalidateContext = { disableRevalidate: true }
const ASSETS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'assets/news')
// Payload stores day-only dates at noon UTC so they never shift across time zones.
const DAY_ONLY_TIME = 'T12:00:00.000Z'

/** Uploads a seed image once; later runs reuse the existing media document (matched by filename). */
async function upsertImage(payload: Payload, image: SeedImage): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: image.file } },
    limit: 1,
    depth: 0,
  })
  const found = existing.docs[0]

  if (found) {
    return found.id
  }

  const created = await payload.create({
    collection: 'media',
    data: { alt: image.alt },
    filePath: path.join(ASSETS_DIR, image.file),
    context: SEED_CONTEXT,
  })

  return created.id
}

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
    ? await upsertImage(payload, article.featuredImage)
    : null
  const gallery: number[] = []
  for (const image of article.gallery) {
    gallery.push(await upsertImage(payload, image))
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
