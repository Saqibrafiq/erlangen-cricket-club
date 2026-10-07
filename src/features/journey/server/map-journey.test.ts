import { describe, expect, it } from 'vitest'

import type { Media } from '@/payload-types'

import { mapJourney } from './map-journey'

const TIMESTAMP = '2026-10-07T12:00:00.000Z'

function media(id: number, url: string): Media {
  return {
    id,
    alt: `Photo ${id}`,
    url,
    width: 1200,
    height: 900,
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
  }
}

describe('mapJourney', () => {
  it('maps the chapters in order', () => {
    const info = mapJourney({
      chapters: [
        { id: 'a', title: 'How it all started', text: 'Since 2011…' },
        { id: 'b', title: 'Our story', text: 'In 2010…' },
      ],
    })

    expect(info.chapters).toEqual([
      { title: 'How it all started', text: 'Since 2011…' },
      { title: 'Our story', text: 'In 2010…' },
    ])
  })

  it('orders milestones oldest first, keeping the order within a year', () => {
    const info = mapJourney({
      milestones: [
        { year: 2023, title: 'Champions again', text: '…' },
        { year: 2015, title: 'Third title', text: '…', link: '/news/odi-2015' },
        { year: 2010, title: 'First players', text: '…' },
        {
          year: 2015,
          title: 'Cricket for everyone',
          text: '…',
          image: media(2, '/api/media/file/school.jpg'),
        },
      ],
    })

    expect(info.milestones.map((m) => m.title)).toEqual([
      'First players',
      'Third title',
      'Cricket for everyone',
      'Champions again',
    ])
    expect(info.milestones[1]?.link).toBe('/news/odi-2015')
    expect(info.milestones[2]?.image?.url).toBe('/api/media/file/school.jpg')
  })

  it('treats missing uploads and links as not there', () => {
    const info = mapJourney({
      milestones: [{ year: 2010, title: 'First players', text: '…', image: 7 }],
    })

    expect(info.milestones[0]).toMatchObject({ image: null, link: null })
  })

  it('handles a page that has not been filled in yet', () => {
    expect(mapJourney({})).toEqual({ chapters: [], milestones: [] })
  })
})
