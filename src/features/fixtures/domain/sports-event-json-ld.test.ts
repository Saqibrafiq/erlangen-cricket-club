import { describe, expect, it } from 'vitest'

import { makeCompletedFixture, makeScheduledFixture } from '../test-factories'
import { buildFixturesJsonLd } from './sports-event-json-ld'

describe('buildFixturesJsonLd', () => {
  it('describes each fixture as a cricket SportsEvent within its competition', () => {
    const [event] = buildFixturesJsonLd([makeCompletedFixture()])['@graph']

    expect(event).toMatchObject({
      '@type': 'SportsEvent',
      name: 'NCC-I v Erlangen Cricket Club I',
      sport: 'Cricket',
      startDate: '2026-09-06',
      superEvent: { name: 'BCV T20 Regionalliga Bayern 2026' },
    })
    expect(event).not.toHaveProperty('location')
  })

  it('includes start time and venue when known', () => {
    const [event] = buildFixturesJsonLd([makeScheduledFixture()])['@graph']

    expect(event).toMatchObject({
      startDate: '2027-05-15T11:00',
      location: { '@type': 'Place', name: 'Erlangen Cricket Ground' },
    })
  })

  it('marks cancelled fixtures as cancelled events', () => {
    const [event] = buildFixturesJsonLd([makeScheduledFixture({ status: 'cancelled' })])['@graph']

    expect(event?.eventStatus).toBe('https://schema.org/EventCancelled')
  })
})
