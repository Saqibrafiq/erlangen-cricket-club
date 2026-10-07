import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { MEMBERSHIP_INFO } from '../test-factories'
import { MembershipView } from './membership-view'

function renderView(info = MEMBERSHIP_INFO) {
  renderWithIntl(
    <MembershipView info={info} contactHref="/contact" directionsHref="/contact#ground" />,
  )
}

describe('MembershipView', () => {
  it('opens with one page heading, the squad photo and the two ways in', () => {
    renderView()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Play cricket in Erlangen')
    expect(screen.getByRole('img', { name: MEMBERSHIP_INFO.heroImage?.alt })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Become a member' })).toHaveAttribute('href', '#join')
    expect(screen.getAllByRole('link', { name: 'Contact us' })[0]).toHaveAttribute(
      'href',
      '/contact',
    )
  })

  it('shows each membership with its fee, reduction, match fee and what it includes', () => {
    renderView()

    const fees = screen.getByRole('region', { name: 'Choose your membership' })
    const [indoor, , active] = within(fees).getAllByRole('heading', { level: 3 })
    const indoorCard = indoor?.closest('li')
    const activeCard = active?.closest('li')

    expect(indoorCard).toHaveTextContent('€50/ year')
    expect(indoorCard).not.toHaveTextContent('youth')
    expect(activeCard).toHaveTextContent('Play league cricket')
    expect(activeCard).toHaveTextContent('€85 for youth (up to 18) and students')
    expect(activeCard).toHaveTextContent('+ €10 per tournament match')
    expect(activeCard).toHaveTextContent('League and tournament matches')
    expect(
      within(activeCard ?? document.body).getByRole('link', { name: 'Join as Active' }),
    ).toHaveAttribute('href', '#join')
  })

  it('lists training and match days with days, times and place', () => {
    renderView()

    const schedule = screen.getByRole('region', { name: 'When we play' })
    expect(schedule).toHaveTextContent('Thursday')
    expect(schedule).toHaveTextContent('17:30 – 20:00')
    expect(schedule).toHaveTextContent('Saturday and Sunday')
    expect(
      within(schedule).getByRole('link', { name: 'How to get to the ground' }),
    ).toHaveAttribute('href', '/contact#ground')
  })

  it('offers the application form in the joining steps', () => {
    renderView()

    const join = screen.getByRole('region', { name: 'Three steps to your first match' })
    expect(within(join).getAllByRole('listitem')).toHaveLength(3)
    expect(within(join).getByRole('link', { name: 'Application form (PDF)' })).toHaveAttribute(
      'href',
      '/api/documents/file/form.pdf',
    )
  })

  it('still works before the board has filled in the page', () => {
    renderView({
      ...MEMBERSHIP_INFO,
      heroImage: null,
      fees: [],
      sessions: [],
      applicationForm: null,
    })

    expect(screen.getByText('Fees will be published here soon.')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'When we play' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Application form (PDF)' })).toBeNull()
  })
})
