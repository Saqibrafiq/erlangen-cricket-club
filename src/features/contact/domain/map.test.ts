import { describe, expect, it } from 'vitest'

import { buildDirectionsUrl, buildLargerMapUrl, buildMapEmbedUrl } from './map'

const GROUND = { latitude: 49.593914, longitude: 10.977194 }

describe('buildMapEmbedUrl', () => {
  it('frames the ground on OpenStreetMap with a marker on it', () => {
    const url = new URL(buildMapEmbedUrl(GROUND))

    expect(url.origin + url.pathname).toBe('https://www.openstreetmap.org/export/embed.html')
    expect(url.searchParams.get('marker')).toBe('49.593914,10.977194')
    expect(url.searchParams.get('layer')).toBe('mapnik')

    const [west, south, east, north] = (url.searchParams.get('bbox') ?? '').split(',').map(Number)
    expect(west).toBeLessThan(GROUND.longitude)
    expect(east).toBeGreaterThan(GROUND.longitude)
    expect(south).toBeLessThan(GROUND.latitude)
    expect(north).toBeGreaterThan(GROUND.latitude)
  })
})

describe('buildLargerMapUrl', () => {
  it('opens the same place on openstreetmap.org', () => {
    expect(buildLargerMapUrl(GROUND)).toBe(
      'https://www.openstreetmap.org/?mlat=49.593914&mlon=10.977194#map=17/49.593914/10.977194',
    )
  })
})

describe('buildDirectionsUrl', () => {
  it('searches the coordinates in Google Maps', () => {
    expect(buildDirectionsUrl(GROUND)).toBe(
      'https://www.google.com/maps/search/?api=1&query=49.593914,10.977194',
    )
  })
})
