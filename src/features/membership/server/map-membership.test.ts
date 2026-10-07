import { describe, expect, it } from 'vitest'

import type { Membership } from '@/payload-types'

import { mapMembership } from './map-membership'

const TIMESTAMP = '2026-10-07T12:00:00.000Z'

const COMPLETE: Partial<Membership> = {
  heroImage: {
    id: 9,
    alt: 'The ECC squad in the new jersey',
    url: '/api/media/file/squad.jpg',
    width: 1280,
    height: 720,
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
  },
  fees: [
    {
      id: 'a',
      name: 'Active',
      includes: 'Everything in Passive\n  League and tournament matches \n\n',
      annualFee: 100,
      reducedFee: 85,
      perMatchFee: 10,
      isHighlighted: true,
    },
  ],
  feesNote: 'Reductions on request.',
  terms: null,
  applicationForm: {
    id: 3,
    title: 'Application form (PDF)',
    url: '/api/documents/file/form.pdf',
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
  },
  sessions: [
    {
      id: 'b',
      title: 'Training',
      days: ['thursday'],
      startTime: '17:30',
      endTime: '20:00',
      venue: 'Erlangen Cricket Ground',
    },
  ],
  sessionsNote: null,
}

describe('mapMembership', () => {
  it('maps the hero image, fees with their checklist, sessions and the form', () => {
    expect(mapMembership(COMPLETE)).toEqual({
      heroImage: {
        url: '/api/media/file/squad.jpg',
        alt: 'The ECC squad in the new jersey',
        width: 1280,
        height: 720,
      },
      fees: [
        {
          name: 'Active',
          includes: ['Everything in Passive', 'League and tournament matches'],
          annualFee: 100,
          reducedFee: 85,
          perMatchFee: 10,
          isHighlighted: true,
        },
      ],
      feesNote: 'Reductions on request.',
      terms: null,
      applicationForm: { title: 'Application form (PDF)', url: '/api/documents/file/form.pdf' },
      sessions: [
        {
          title: 'Training',
          days: ['thursday'],
          startTime: '17:30',
          endTime: '20:00',
          venue: 'Erlangen Cricket Ground',
        },
      ],
      sessionsNote: null,
    })
  })

  it('treats missing reductions, match fees and highlights as none', () => {
    const fees = [{ name: 'Indoor', includes: 'Indoor cricket', annualFee: 50 }]

    expect(mapMembership({ fees }).fees[0]).toEqual({
      name: 'Indoor',
      includes: ['Indoor cricket'],
      annualFee: 50,
      reducedFee: null,
      perMatchFee: null,
      isHighlighted: false,
    })
  })

  it('handles a page that has not been filled in yet', () => {
    expect(mapMembership({})).toEqual({
      heroImage: null,
      fees: [],
      feesNote: null,
      terms: null,
      applicationForm: null,
      sessions: [],
      sessionsNote: null,
    })
  })

  it('skips uploads that are not populated', () => {
    const info = mapMembership({ heroImage: 9, applicationForm: 3 })

    expect(info.heroImage).toBeNull()
    expect(info.applicationForm).toBeNull()
  })
})
