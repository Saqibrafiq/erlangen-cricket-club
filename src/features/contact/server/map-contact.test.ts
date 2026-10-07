import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/shared/config/site'

import { mapContact } from './map-contact'

const GROUND = {
  name: 'Erlangen Cricket Ground',
  street: 'Siedlerstraße 1',
  postalCode: '91056',
  city: 'Erlangen',
  latitude: 49.593914,
  longitude: 10.977194,
  directions: 'Walk from the station.',
}

describe('mapContact', () => {
  it('maps email, social links and the ground with its coordinates', () => {
    expect(
      mapContact({
        email: 'club@example.com',
        facebookUrl: 'https://facebook.example/ecc',
        instagramUrl: null,
        ground: GROUND,
      }),
    ).toEqual({
      email: 'club@example.com',
      facebookUrl: 'https://facebook.example/ecc',
      instagramUrl: null,
      ground: {
        name: 'Erlangen Cricket Ground',
        street: 'Siedlerstraße 1',
        postalCode: '91056',
        city: 'Erlangen',
        coordinates: { latitude: 49.593914, longitude: 10.977194 },
        directions: 'Walk from the station.',
      },
    })
  })

  it('works before the board has filled in the contact page', () => {
    expect(mapContact({})).toEqual({
      email: siteConfig.email,
      facebookUrl: null,
      instagramUrl: null,
      ground: null,
    })
  })

  it.each([
    ['its address is incomplete', { ...GROUND, street: '' }],
    ['its position is missing', { ...GROUND, latitude: null }],
  ])('shows no ground while %s', (_, ground) => {
    expect(mapContact({ ground: ground as typeof GROUND }).ground).toBeNull()
  })
})
