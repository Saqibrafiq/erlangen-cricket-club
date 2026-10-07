import type { Payload } from 'payload'

import { SEED_JOURNEY } from './data/journey'
import { findMediaId, SEED_CONTEXT, upsertImage } from './media'
import type { SeedJourney } from './types'

const JOURNEY_ASSETS = 'journey'

type Milestone = SeedJourney['milestones'][number]

/** New journey images are uploaded; images from the news are reused from the media library. */
async function resolveImage(payload: Payload, image: Milestone['image']): Promise<number | null> {
  if (!image) {
    return null
  }
  return 'alt' in image
    ? upsertImage(payload, JOURNEY_ASSETS, image)
    : findMediaId(payload, image.file)
}

/** Fills in the journey page once; an edited page (any milestone entered) is left untouched. */
export async function seedJourney(payload: Payload): Promise<void> {
  const current = await payload.findGlobal({ slug: 'journey', depth: 0 })
  if ((current.milestones ?? []).length > 0) {
    payload.logger.info('Journey: already filled in.')
    return
  }

  const images: (number | null)[] = []
  for (const milestone of SEED_JOURNEY.milestones) {
    images.push(await resolveImage(payload, milestone.image))
  }

  const english = await payload.updateGlobal({
    slug: 'journey',
    locale: 'en',
    context: SEED_CONTEXT,
    data: {
      chapters: SEED_JOURNEY.chapters.map((chapter) => ({
        title: chapter.title.en,
        text: chapter.text.en,
      })),
      milestones: SEED_JOURNEY.milestones.map((milestone, index) => ({
        year: milestone.year,
        title: milestone.title.en,
        text: milestone.text.en,
        image: images[index] ?? null,
        link: milestone.link ?? null,
      })),
    },
  })

  // German fills in the rows written in English (same ids) instead of replacing them.
  const rowIds = (english.milestones ?? []).map((row) => row.id)
  const chapterIds = (english.chapters ?? []).map((row) => row.id)
  await payload.updateGlobal({
    slug: 'journey',
    locale: 'de',
    context: SEED_CONTEXT,
    data: {
      chapters: SEED_JOURNEY.chapters.map((chapter, index) => ({
        ...(chapterIds[index] ? { id: chapterIds[index] } : {}),
        title: chapter.title.de,
        text: chapter.text.de,
      })),
      milestones: SEED_JOURNEY.milestones.map((milestone, index) => ({
        ...(rowIds[index] ? { id: rowIds[index] } : {}),
        year: milestone.year,
        title: milestone.title.de,
        text: milestone.text.de,
        image: images[index] ?? null,
        link: milestone.link ?? null,
      })),
    },
  })

  payload.logger.info(
    `Journey: chapters and ${SEED_JOURNEY.milestones.length} milestones filled in (en, de).`,
  )
}
