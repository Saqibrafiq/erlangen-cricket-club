import { describe, expect, it } from 'vitest'

import { buildAlternates, buildSportsOrganizationJsonLd } from './seo'

describe('buildAlternates', () => {
  it('uses the localized path of the current locale as canonical', () => {
    expect(buildAlternates('/players', 'de').canonical).toBe('/de/players')
  })

  it('lists every locale plus x-default pointing at the default locale', () => {
    expect(buildAlternates('/', 'en').languages).toEqual({
      en: '/',
      de: '/de',
      'x-default': '/',
    })
  })
})

describe('buildSportsOrganizationJsonLd', () => {
  it('describes the club as a cricket SportsOrganization in Erlangen', () => {
    expect(buildSportsOrganizationJsonLd()).toMatchObject({
      '@type': 'SportsOrganization',
      sport: 'Cricket',
      address: { addressLocality: 'Erlangen', addressCountry: 'DE' },
    })
  })
})
