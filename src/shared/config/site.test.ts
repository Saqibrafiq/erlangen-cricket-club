import { describe, expect, it } from 'vitest'

import { resolveSiteUrl } from './site'

describe('resolveSiteUrl', () => {
  it('uses the explicitly configured site URL', () => {
    expect(
      resolveSiteUrl({
        siteUrl: 'https://erlangencricketclub.de',
        vercelProductionHost: 'ecc.vercel.app',
      }),
    ).toBe('https://erlangencricketclub.de')
  })

  it('falls back to the Vercel production domain over https', () => {
    expect(resolveSiteUrl({ siteUrl: '', vercelProductionHost: 'ecc.vercel.app' })).toBe(
      'https://ecc.vercel.app',
    )
  })

  it('falls back to localhost outside Vercel', () => {
    expect(resolveSiteUrl({ siteUrl: undefined, vercelProductionHost: '' })).toBe(
      'http://localhost:3000',
    )
  })

  it('throws when the configured site URL is not a URL', () => {
    expect(() =>
      resolveSiteUrl({ siteUrl: 'erlangencricketclub.de', vercelProductionHost: undefined }),
    ).toThrow()
  })
})
