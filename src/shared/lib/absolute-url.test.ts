import { describe, expect, it } from 'vitest'

import { toAbsoluteUrl } from './absolute-url'

const SITE_URL = 'https://erlangen-cricket-club.vercel.app'

describe('toAbsoluteUrl', () => {
  it('resolves a path against the site', () => {
    expect(toAbsoluteUrl('/api/media/file/crest.png', SITE_URL)).toBe(
      `${SITE_URL}/api/media/file/crest.png`,
    )
  })

  it('keeps an absolute URL as it is', () => {
    const blobUrl = 'https://store.public.blob.vercel-storage.com/crest.png'
    expect(toAbsoluteUrl(blobUrl, SITE_URL)).toBe(blobUrl)
  })
})
