import type { MembershipInfo } from './types'

/** Test and Storybook data, from the club's membership page and application form. */
export const MEMBERSHIP_INFO: MembershipInfo = {
  heroImage: {
    url: '/api/media/file/unveiling-erlangen-cricket-clubs-new-jersey-1.jpg',
    alt: 'The ECC squad in the new orange and navy jersey',
    width: 1280,
    height: 720,
  },
  fees: [
    {
      name: 'Indoor',
      includes: ['Indoor cricket in winter'],
      annualFee: 50,
      reducedFee: null,
      perMatchFee: null,
      isHighlighted: false,
    },
    {
      name: 'Passive',
      includes: ['Indoor cricket', 'Outdoor friendlies', 'Training sessions'],
      annualFee: 100,
      reducedFee: 85,
      perMatchFee: null,
      isHighlighted: false,
    },
    {
      name: 'Active',
      includes: ['Everything in Passive', 'League and tournament matches'],
      annualFee: 100,
      reducedFee: 85,
      perMatchFee: 10,
      isHighlighted: true,
    },
  ],
  feesNote: 'Reductions are possible after talking to the board.',
  terms: 'Either side can cancel in writing with three months’ notice.',
  applicationForm: { title: 'Application form (PDF)', url: '/api/documents/file/form.pdf' },
  sessions: [
    {
      title: 'Training',
      days: ['thursday'],
      startTime: '17:30',
      endTime: '20:00',
      venue: 'Erlangen Cricket Ground',
    },
    {
      title: 'Match days',
      days: ['saturday', 'sunday'],
      startTime: '11:00',
      endTime: '18:00',
      venue: 'Erlangen Cricket Ground (home matches)',
    },
  ],
  sessionsNote: 'Changes are announced on Facebook.',
}
