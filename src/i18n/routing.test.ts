import { describe, expect, it } from 'vitest'

import { getLocalizedPath } from './routing'

describe('getLocalizedPath', () => {
  it('keeps default-locale paths unprefixed', () => {
    expect(getLocalizedPath('/players', 'en')).toBe('/players')
  })

  it('prefixes non-default locales', () => {
    expect(getLocalizedPath('/players', 'de')).toBe('/de/players')
  })

  it('maps the root path to the bare locale prefix', () => {
    expect(getLocalizedPath('/', 'de')).toBe('/de')
  })

  it('adds a missing leading slash', () => {
    expect(getLocalizedPath('stories', 'en')).toBe('/stories')
  })
})
