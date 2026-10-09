import { describe, expect, it, vi } from 'vitest'

import type { Media, News, Sponsor as SponsorDoc } from '@/payload-types'

import { mapSponsor } from './map-sponsor'

// The news feature's public API also exports its server queries; only the path helper is needed.
vi.mock('@/features/news', () => ({ getNewsPath: (slug: string) => `/news/${slug}` }))

const TIMESTAMP = '2026-10-09T12:00:00.000Z'

const LOGO: Media = {
  id: 4,
  alt: 'mein-banker logo',
  url: '/api/media/file/mein-banker.png',
  width: 600,
  height: 200,
  updatedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
}

function news(overrides: Partial<News> = {}): News {
  return {
    id: 7,
    title: 'New title sponsor',
    excerpt: '…',
    featuredImageStyle: 'logo',
    body: {
      root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 },
    },
    publishedAt: TIMESTAMP,
    slug: 'new-title-sponsor',
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
    _status: 'published',
    ...overrides,
  }
}

function doc(overrides: Partial<SponsorDoc> = {}): SponsorDoc {
  return {
    id: 1,
    name: 'mein-banker',
    logo: LOGO,
    tier: 'title',
    since: 2024,
    description: 'Personal financial advice.',
    website: 'https://www.mein-banker.de/tonymueller',
    announcement: news(),
    isActive: true,
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
    ...overrides,
  }
}

describe('mapSponsor', () => {
  it('maps name, logo, tier, year, description, website and announcement link', () => {
    expect(mapSponsor(doc())).toEqual({
      id: 1,
      name: 'mein-banker',
      logo: {
        url: '/api/media/file/mein-banker.png',
        alt: 'mein-banker logo',
        width: 600,
        height: 200,
      },
      tier: 'title',
      since: 2024,
      description: 'Personal financial advice.',
      website: 'https://www.mein-banker.de/tonymueller',
      announcementHref: '/news/new-title-sponsor',
    })
  })

  it('does not link an announcement that is still a draft', () => {
    expect(
      mapSponsor(doc({ announcement: news({ _status: 'draft' }) })).announcementHref,
    ).toBeNull()
  })

  it('treats unpopulated or missing relations as not there', () => {
    const sponsor = mapSponsor(doc({ logo: 4, announcement: null, website: null }))

    expect(sponsor).toMatchObject({ logo: null, announcementHref: null, website: null })
  })
})
