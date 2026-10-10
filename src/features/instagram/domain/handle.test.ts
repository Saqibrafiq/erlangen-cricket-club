import { describe, expect, it } from 'vitest'

import { getInstagramHandle } from './handle'

describe('getInstagramHandle', () => {
  it('reads the handle from a profile link', () => {
    expect(getInstagramHandle('https://www.instagram.com/er_cricketclub/')).toBe('@er_cricketclub')
    expect(getInstagramHandle('https://instagram.com/er_cricketclub?hl=de')).toBe('@er_cricketclub')
  })

  it.each(['https://www.facebook.com/club', 'https://www.instagram.com/', 'not a url'])(
    'has no handle for "%s"',
    (url) => {
      expect(getInstagramHandle(url)).toBeNull()
    },
  )
})
