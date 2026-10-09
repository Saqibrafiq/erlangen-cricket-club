import { describe, expect, it } from 'vitest'

import type { Sponsor } from '../types'
import { buildSponsorsJsonLd, sortSponsors } from './sponsors'

function sponsor(overrides: Partial<Sponsor>): Sponsor {
  return {
    id: 1,
    name: 'Sponsor',
    logo: null,
    tier: 'sponsor',
    since: 2024,
    description: '…',
    website: null,
    announcementHref: null,
    ...overrides,
  }
}

const CLUB = { name: 'Erlangen Cricket Club', url: 'https://ecc.example' }

describe('sortSponsors', () => {
  it('puts title sponsors first, then the longest-standing, then by name', () => {
    const sorted = sortSponsors([
      sponsor({ name: 'Newer', since: 2025 }),
      sponsor({ name: 'Beta', since: 2023 }),
      sponsor({ name: 'Title', tier: 'title', since: 2026 }),
      sponsor({ name: 'Alpha', since: 2023 }),
    ])

    expect(sorted.map((s) => s.name)).toEqual(['Title', 'Alpha', 'Beta', 'Newer'])
  })

  it('leaves the input untouched', () => {
    const sponsors = [sponsor({ name: 'B', since: 2025 }), sponsor({ name: 'A', since: 2020 })]

    sortSponsors(sponsors)

    expect(sponsors.map((s) => s.name)).toEqual(['B', 'A'])
  })
})

describe('buildSponsorsJsonLd', () => {
  it('names the club and each sponsor with website and absolute logo URL', () => {
    const jsonLd = buildSponsorsJsonLd(
      [
        sponsor({
          name: 'mein-banker',
          website: 'https://www.mein-banker.de/tonymueller',
          logo: { url: '/api/media/file/logo.png', alt: 'Logo', width: 300, height: 100 },
        }),
      ],
      CLUB,
    )

    expect(jsonLd).toEqual({
      '@context': 'https://schema.org',
      '@type': 'SportsOrganization',
      name: 'Erlangen Cricket Club',
      url: 'https://ecc.example',
      sponsor: [
        {
          '@type': 'Organization',
          name: 'mein-banker',
          url: 'https://www.mein-banker.de/tonymueller',
          logo: 'https://ecc.example/api/media/file/logo.png',
        },
      ],
    })
  })

  it('keeps absolute logo URLs and leaves out what is missing', () => {
    const [withBlobLogo, bare] = buildSponsorsJsonLd(
      [
        sponsor({
          name: 'Blob',
          logo: { url: 'https://blob.example/logo.png', alt: 'Logo', width: 1, height: 1 },
        }),
        sponsor({ name: 'Bare' }),
      ],
      CLUB,
    ).sponsor

    expect(withBlobLogo).toEqual({
      '@type': 'Organization',
      name: 'Blob',
      logo: 'https://blob.example/logo.png',
    })
    expect(bare).toEqual({ '@type': 'Organization', name: 'Bare' })
  })
})
