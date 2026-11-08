import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/shared/config/site'

import { buildAlternates, buildBreadcrumbJsonLd, buildSportsOrganizationJsonLd } from './seo'

describe('buildBreadcrumbJsonLd', () => {
  it('lists positioned items with absolute localised URLs', () => {
    expect(
      buildBreadcrumbJsonLd(
        [
          { name: 'Spielplan & Ergebnisse', pathname: '/fixtures' },
          { name: 'BCV Regionalliga Bayern 2026', pathname: '/fixtures/bcv-rl-2026' },
        ],
        'de',
      ).itemListElement,
    ).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Spielplan & Ergebnisse',
        item: 'http://localhost:3000/de/fixtures',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'BCV Regionalliga Bayern 2026',
        item: 'http://localhost:3000/de/fixtures/bcv-rl-2026',
      },
    ])
  })
})

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

  it('shows the crest as the logo', () => {
    expect(buildSportsOrganizationJsonLd().logo).toBe(`${siteConfig.url}/icon.png`)
  })

  it("links the club's profiles and its former website", () => {
    expect(
      buildSportsOrganizationJsonLd(['https://www.instagram.com/erlangencricketclub']).sameAs,
    ).toEqual([
      'https://www.instagram.com/erlangencricketclub',
      'https://erlangencricketclub.wordpress.com/',
    ])
  })
})
