import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { JOURNEY_INFO } from '../test-factories'
import { JourneyView } from './journey-view'

function renderView(info = JOURNEY_INFO) {
  renderWithIntl(<JourneyView info={info} membershipHref="/membership" />)
}

describe('JourneyView', () => {
  it('opens with one page heading and the club in four figures', () => {
    renderView()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'From the first players to Bavaria’s top leagues',
    )
    const titles = screen.getByText('Titles')
    expect(titles.nextElementSibling).toHaveTextContent('7')
  })

  it('tells the story in chapters', () => {
    renderView()

    const story = screen.getByRole('region', { name: 'Who we are' })
    expect(
      within(story)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['How it all started', 'Our story', 'Our approach'])
  })

  it('lists the milestones under their years, with a jump link to each year', () => {
    renderView()

    const timeline = screen.getByRole('region', { name: 'From 2010 to today' })
    expect(
      within(timeline)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['2010', '2023', '2026'])
    expect(within(timeline).getByRole('navigation', { name: 'Jump to a year' })).toContainElement(
      within(timeline).getByRole('link', { name: '2023' }),
    )
    expect(within(timeline).getByRole('link', { name: '2023' })).toHaveAttribute(
      'href',
      '#year-2023',
    )
  })

  it('links milestones to their story where there is one', () => {
    renderView()

    const timeline = screen.getByRole('region', { name: 'From 2010 to today' })
    const [first, second, third] = within(timeline).getAllByRole('article')
    expect(within(first ?? document.body).queryByRole('link')).toBeNull()
    expect(
      within(second ?? document.body).getByRole('link', { name: 'Read more' }),
    ).toHaveAttribute('href', '/news/the-triumph-of-resilience-eccs-journey-in-2023')
    expect(within(third ?? document.body).getByRole('link', { name: 'Read more' })).toHaveAttribute(
      'href',
      '/standings',
    )
  })

  it('opens external milestone links in a new tab', () => {
    renderView({
      chapters: [],
      milestones: [
        {
          year: 2010,
          title: 'External',
          text: '…',
          image: null,
          link: 'https://example.com/report',
        },
      ],
    })

    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute('target', '_blank')
  })

  it('invites visitors to become members', () => {
    renderView()

    expect(screen.getByRole('link', { name: 'Become a member' })).toHaveAttribute(
      'href',
      '/membership',
    )
  })

  it('still works before the story and milestones are written', () => {
    renderView({ chapters: [], milestones: [] })

    expect(screen.queryByRole('region', { name: 'Who we are' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'From 2010 to today' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Become a member' })).toBeInTheDocument()
  })
})
