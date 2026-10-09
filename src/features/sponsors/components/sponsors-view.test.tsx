import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { SPONSOR, TITLE_SPONSOR } from '../test-factories'
import { SponsorsView } from './sponsors-view'

function renderView(sponsors = [TITLE_SPONSOR, SPONSOR]) {
  renderWithIntl(<SponsorsView sponsors={sponsors} contactHref="/contact" />)
}

describe('SponsorsView', () => {
  it('thanks the sponsors and leads to becoming one', () => {
    renderView()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Thank you to our sponsors')
    expect(screen.getByRole('link', { name: 'Become a sponsor' })).toHaveAttribute(
      'href',
      '#become-a-sponsor',
    )
  })

  it('shows each sponsor with logo, level, year and description, title sponsor first', () => {
    renderView()

    const [title, sponsor] = screen.getAllByRole('article')
    expect(title).toHaveTextContent('Title sponsor')
    expect(title).toHaveTextContent('Since 2024')
    expect(
      within(title ?? document.body).getByRole('img', { name: 'mein-banker logo' }),
    ).toBeVisible()
    expect(within(title ?? document.body).getByRole('heading', { level: 3 })).toHaveTextContent(
      'mein-banker',
    )
    expect(sponsor).toHaveTextContent('Sponsor')
    expect(sponsor).toHaveTextContent('Since 2025')
  })

  it('links to the sponsor’s website in a new tab and to the announcement', () => {
    renderView([TITLE_SPONSOR])

    const card = screen.getByRole('article')
    const website = within(card).getByRole('link', { name: /Visit website/ })
    expect(website).toHaveAttribute('href', 'https://www.mein-banker.de/tonymueller')
    expect(website).toHaveAttribute('target', '_blank')
    expect(website).toHaveAccessibleName(/website of mein-banker, opens in a new tab/)
    expect(within(card).getByRole('link', { name: 'Read the announcement' })).toHaveAttribute(
      'href',
      '/news/new-title-sponsor',
    )
  })

  it('shows the name when a sponsor has no logo, and no links when there are none', () => {
    renderView([{ ...SPONSOR, logo: null, website: null, announcementHref: null }])

    const card = screen.getByRole('article')
    expect(within(card).queryByRole('img')).toBeNull()
    expect(within(card).queryByRole('link')).toBeNull()
    expect(within(card).getAllByText('OVB Finanzberater Denis Martin')).toHaveLength(2)
  })

  it('explains why to sponsor and how to get in touch', () => {
    renderView()

    const benefits = screen.getByRole('region', { name: 'Why sponsor Erlangen Cricket Club' })
    expect(
      within(benefits)
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent),
    ).toEqual(['Visibility', 'Community', 'Impact'])
    expect(screen.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact')
  })

  it('still invites sponsors while the list is empty', () => {
    renderView([])

    expect(screen.getByText('Our sponsor list is being updated.')).toBeInTheDocument()
    expect(screen.queryByRole('article')).toBeNull()
    expect(screen.getByRole('link', { name: 'Contact us' })).toBeInTheDocument()
  })
})
