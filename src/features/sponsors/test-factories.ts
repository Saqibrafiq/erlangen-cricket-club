import type { Sponsor } from './types'

/** Test and Storybook data, from the club's sponsor announcements. */
export const TITLE_SPONSOR: Sponsor = {
  id: 1,
  name: 'mein-banker',
  logo: {
    url: '/api/media/file/new-title-sponsor-1.png',
    alt: 'mein-banker logo',
    width: 600,
    height: 200,
  },
  tier: 'title',
  since: 2024,
  description:
    'mein-banker offers personal financial advice across banking, investments and insurance.',
  website: 'https://www.mein-banker.de/tonymueller',
  announcementHref: '/news/new-title-sponsor',
}

export const SPONSOR: Sponsor = {
  id: 2,
  name: 'OVB Finanzberater Denis Martin',
  logo: { url: '/api/media/file/ovb-logo.png', alt: 'OVB logo', width: 350, height: 350 },
  tier: 'sponsor',
  since: 2025,
  description:
    'Denis Martin, financial advisor with OVB in Nuremberg, offers personal financial planning.',
  website: 'https://www.ovb.de/finanzberater/nuernberg-martin-denis.html',
  announcementHref: '/news/new-sponsor-ovb-finanzberater-denis-martin',
}
