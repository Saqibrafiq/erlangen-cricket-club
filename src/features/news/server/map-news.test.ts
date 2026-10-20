import { describe, expect, it } from 'vitest'

import type { Media, News } from '@/payload-types'

import {
  mapNewsArticle,
  mapNewsDraft,
  mapNewsImage,
  mapNewsSummary,
  toEditorImage,
  toStoredBody,
} from './map-news'

const TIMESTAMP = '2026-10-07T12:00:00.000Z'

function media(overrides: Partial<Media> = {}): Media {
  return {
    id: 10,
    alt: 'OVB logo',
    url: '/api/media/file/ovb-logo.png',
    width: 350,
    height: 350,
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
    ...overrides,
  }
}

function newsDoc(overrides: Partial<News> = {}): News {
  return {
    id: 1,
    title: 'New sponsor',
    excerpt: 'We welcome a new sponsor.',
    featuredImage: media(),
    featuredImageStyle: 'logo',
    body: {
      root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 },
    },
    gallery: [],
    publishedAt: '2025-06-12T12:00:00.000Z',
    slug: 'new-sponsor',
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
    _status: 'published',
    ...overrides,
  }
}

describe('mapNewsImage', () => {
  it('returns url, alt and dimensions of an uploaded image', () => {
    expect(mapNewsImage(media())).toEqual({
      url: '/api/media/file/ovb-logo.png',
      alt: 'OVB logo',
      width: 350,
      height: 350,
    })
  })

  it.each([
    ['no image', null],
    ['an unpopulated relation', 10],
    ['an image without file', media({ url: null })],
    ['an image without dimensions', media({ width: null })],
  ])('returns null for %s', (_, value) => {
    expect(mapNewsImage(value)).toBeNull()
  })
})

describe('mapNewsSummary', () => {
  it('maps the card fields, keeping the image style', () => {
    expect(mapNewsSummary(newsDoc())).toEqual({
      id: 1,
      slug: 'new-sponsor',
      title: 'New sponsor',
      excerpt: 'We welcome a new sponsor.',
      publishedAt: '2025-06-12T12:00:00.000Z',
      image: { url: '/api/media/file/ovb-logo.png', alt: 'OVB logo', width: 350, height: 350 },
      imageStyle: 'logo',
    })
  })
})

describe('mapNewsArticle', () => {
  it('keeps gallery photos in order and drops unusable ones', () => {
    const article = mapNewsArticle(
      newsDoc({
        gallery: [
          media({ id: 11, url: '/api/media/file/a.jpg', alt: 'First' }),
          12,
          media({ id: 13, url: '/api/media/file/b.jpg', alt: 'Second' }),
        ],
      }),
    )

    expect(article.gallery.map((image) => image.alt)).toEqual(['First', 'Second'])
    expect(article.updatedAt).toBe(TIMESTAMP)
  })

  it('has an empty gallery when none was uploaded', () => {
    expect(mapNewsArticle(newsDoc({ gallery: null })).gallery).toEqual([])
  })
})

describe('mapNewsDraft', () => {
  it('gives the editor the article with image ids, the day and the status', () => {
    const draft = mapNewsDraft(
      newsDoc({
        publishedAt: '2026-10-12T12:00:00.000Z',
        gallery: [media({ id: 11 }), 12, media({ id: 13, url: null })],
        _status: 'draft',
      }),
    )

    expect(draft).toMatchObject({
      id: 1,
      publishedAt: '2026-10-12',
      featuredImage: { id: 10, url: '/api/media/file/ovb-logo.png' },
      featuredImageStyle: 'logo',
      status: 'draft',
    })
    // Unpopulated or file-less images are left out.
    expect(draft.gallery.map((image) => image.id)).toEqual([11])
  })

  it('treats anything but a draft as published, and copes without images', () => {
    expect(
      mapNewsDraft(newsDoc({ featuredImage: null, gallery: null, _status: 'published' })),
    ).toMatchObject({ featuredImage: null, gallery: [], status: 'published' })
  })
})

describe('toEditorImage', () => {
  it('needs a populated image with a file', () => {
    expect(toEditorImage(media())).toMatchObject({ id: 10, width: 350 })
    expect(toEditorImage(7)).toBeNull()
    expect(toEditorImage(null)).toBeNull()
  })
})

describe('toStoredBody', () => {
  it('fills in what Payload’s stored text requires', () => {
    expect(
      toStoredBody({
        root: { type: 'root', direction: 'rtl', children: [{ type: 'paragraph' }] },
      }),
    ).toEqual({
      root: {
        type: 'root',
        direction: 'rtl',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'paragraph', version: 1 }],
      },
    })
  })

  it('keeps node versions and defaults the direction', () => {
    const stored = toStoredBody({
      root: { type: 'root', children: [{ type: 'quote', version: 2 }] },
    })

    expect(stored.root).toMatchObject({ direction: 'ltr', children: [{ version: 2 }] })
    expect(toStoredBody({ root: { type: 'root' } }).root.children).toEqual([])
  })
})
