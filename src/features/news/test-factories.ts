import type { NewsArticle, NewsSummary } from './types'

/** Test and Storybook data, modelled on the two articles migrated from the old website. */
export const SPONSOR_NEWS: NewsSummary = {
  id: 1,
  slug: 'new-sponsor-ovb-finanzberater-denis-martin',
  title: 'Erlangen Cricket Club Welcomes New Sponsor: OVB Finanzberater Denis Martin',
  excerpt:
    'We welcome Denis Martin, financial advisor with OVB in Nuremberg, as a new sponsor of Erlangen Cricket Club for the upcoming season.',
  publishedAt: '2025-06-12T12:00:00.000Z',
  image: { url: '/api/media/file/ovb-logo.png', alt: 'OVB logo', width: 350, height: 350 },
  imageStyle: 'logo',
}

export const AGM_NEWS: NewsSummary = {
  id: 2,
  slug: 'annual-general-meeting-2024-key-takeaways',
  title: 'Key Takeaways from the Annual General Meeting 2024',
  excerpt: 'Players, members and supporters came together for our Annual General Meeting 2024.',
  publishedAt: '2024-12-19T12:00:00.000Z',
  image: {
    url: '/api/media/file/agm-2024-1.jpg',
    alt: 'Club members seated around tables during the Annual General Meeting',
    width: 1600,
    height: 1200,
  },
  imageStyle: 'photo',
}

export const AGM_ARTICLE: NewsArticle = {
  ...AGM_NEWS,
  updatedAt: '2026-10-07T12:00:00.000Z',
  body: {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
          children: [
            {
              type: 'text',
              text: 'The meeting concluded with renewed excitement for the future.',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              version: 1,
            },
          ],
        },
      ],
    },
  },
  gallery: [
    {
      url: '/api/media/file/agm-2024-4.jpg',
      alt: 'Two members smiling, one holding an award trophy',
      width: 1200,
      height: 1600,
    },
  ],
}
