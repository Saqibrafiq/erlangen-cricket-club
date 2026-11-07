import { describe, expect, it } from 'vitest'

import { getDirectionsUrl } from './directions'

describe('getDirectionsUrl', () => {
  it('links to Google Maps directions to the ground', () => {
    expect(getDirectionsUrl('Siedlerstraße 1, Erlangen')).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Siedlerstra%C3%9Fe%201%2C%20Erlangen',
    )
  })
})
