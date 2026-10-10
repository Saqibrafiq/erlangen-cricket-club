import { describe, expect, it } from 'vitest'

import { mediaResponseSchema, refreshResponseSchema, shouldRenewToken, toPosts } from './feed'

const IMAGE = {
  id: '1',
  caption: '  Matchday in Erlangen  ',
  media_type: 'IMAGE',
  media_url: 'https://scontent.cdninstagram.com/1.jpg',
  permalink: 'https://www.instagram.com/p/1/',
  timestamp: '2026-09-06T18:00:00+0000',
}
const VIDEO = {
  id: '2',
  media_type: 'VIDEO',
  media_url: 'https://scontent.cdninstagram.com/2.mp4',
  thumbnail_url: 'https://scontent.cdninstagram.com/2.jpg',
  permalink: 'https://www.instagram.com/reel/2/',
  timestamp: '2026-09-05T18:00:00+0000',
}
const ALBUM_WITHOUT_PICTURE = {
  id: '3',
  media_type: 'CAROUSEL_ALBUM',
  permalink: 'https://www.instagram.com/p/3/',
  timestamp: '2026-09-04T18:00:00+0000',
}

describe('toPosts', () => {
  it('shows images by their picture and videos by their thumbnail, trimming captions', () => {
    const posts = toPosts(mediaResponseSchema.parse({ data: [IMAGE, VIDEO] }), 6)

    expect(posts).toEqual([
      {
        id: '1',
        imageUrl: 'https://scontent.cdninstagram.com/1.jpg',
        caption: 'Matchday in Erlangen',
        permalink: 'https://www.instagram.com/p/1/',
        isVideo: false,
        postedAt: '2026-09-06T18:00:00+0000',
      },
      expect.objectContaining({
        imageUrl: 'https://scontent.cdninstagram.com/2.jpg',
        caption: null,
        isVideo: true,
      }),
    ])
  })

  it('skips posts without a picture and stops at the limit', () => {
    const response = mediaResponseSchema.parse({ data: [ALBUM_WITHOUT_PICTURE, IMAGE, VIDEO] })

    expect(toPosts(response, 1).map((post) => post.id)).toEqual(['1'])
  })
})

describe('response schemas', () => {
  it('reject unexpected data from Instagram', () => {
    expect(mediaResponseSchema.safeParse({ data: [{ id: 1 }] }).success).toBe(false)
    expect(refreshResponseSchema.safeParse({ access_token: '' }).success).toBe(false)
  })
})

describe('shouldRenewToken', () => {
  const NOW = new Date('2026-10-10T12:00:00.000Z')

  it('renews a token that was never renewed', () => {
    expect(shouldRenewToken(null, NOW)).toBe(true)
    expect(shouldRenewToken(undefined, NOW)).toBe(true)
  })

  it('renews weekly', () => {
    expect(shouldRenewToken('2026-10-04T12:00:00.000Z', NOW)).toBe(false)
    expect(shouldRenewToken('2026-10-03T12:00:00.000Z', NOW)).toBe(true)
  })
})
