import { getNewsPath } from '@/features/news'
import type { Media, News, Sponsor as SponsorDoc } from '@/payload-types'

import type { Sponsor, SponsorLogo } from '../types'

function mapLogo(media: number | Media | null | undefined): SponsorLogo | null {
  if (typeof media !== 'object' || !media?.url || !media.width || !media.height) {
    return null
  }

  return { url: media.url, alt: media.alt, width: media.width, height: media.height }
}

function mapAnnouncement(news: number | News | null | undefined): string | null {
  if (typeof news !== 'object' || !news?.slug || news._status !== 'published') {
    return null
  }

  return getNewsPath(news.slug)
}

/** Maps a sponsor (queried with depth >= 1) to the view model; drafts are never linked. */
export function mapSponsor(doc: SponsorDoc): Sponsor {
  return {
    id: doc.id,
    name: doc.name,
    logo: mapLogo(doc.logo),
    tier: doc.tier,
    since: doc.since,
    description: doc.description,
    website: doc.website ?? null,
    announcementHref: mapAnnouncement(doc.announcement),
  }
}
