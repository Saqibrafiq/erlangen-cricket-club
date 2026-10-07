import type { Journey, Media } from '@/payload-types'

import type { JourneyImage, JourneyInfo } from '../types'

function mapImage(media: number | Media | null | undefined): JourneyImage | null {
  if (typeof media !== 'object' || !media?.url || !media.width || !media.height) {
    return null
  }

  return { url: media.url, alt: media.alt, width: media.width, height: media.height }
}

/** Maps the journey global (queried with depth >= 1); milestones oldest first. */
export function mapJourney(global: Partial<Journey>): JourneyInfo {
  return {
    chapters: (global.chapters ?? []).map(({ title, text }) => ({ title, text })),
    milestones: (global.milestones ?? [])
      .map((milestone) => ({
        year: milestone.year,
        title: milestone.title,
        text: milestone.text,
        image: mapImage(milestone.image),
        link: milestone.link ?? null,
      }))
      // Stable sort: milestones of the same year keep the editor's order.
      .toSorted((a, b) => a.year - b.year),
  }
}
