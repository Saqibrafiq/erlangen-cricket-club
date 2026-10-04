import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { STANDINGS_ROWS } from '../test-factories'
import { ClubStandingCard } from './club-standing-card'

// ECC-I: 2nd of the four test rows.
const ECC_ROW = STANDINGS_ROWS[1]

describe('ClubStandingCard', () => {
  it('shows the position as an ordinal out of the table size', () => {
    if (!ECC_ROW) throw new Error('test data needs a club row')
    renderWithIntl(<ClubStandingCard row={ECC_ROW} teamCount={8} />)

    const card = screen.getByRole('article')
    expect(within(card).getByRole('heading', { name: 'Erlangen Cricket Club I' })).toBeVisible()
    expect(within(card).getByText('2nd')).toBeInTheDocument()
    expect(within(card).getByText('of 8 teams')).toBeInTheDocument()
  })

  it('lists points, wins, losses and net run rate as published', () => {
    if (!ECC_ROW) throw new Error('test data needs a club row')
    renderWithIntl(<ClubStandingCard row={ECC_ROW} teamCount={8} />)

    const value = (label: string) => screen.getByText(label).nextElementSibling?.textContent
    expect(value('Points')).toBe('80')
    expect(value('Won')).toBe('9')
    expect(value('Lost')).toBe('3')
    expect(value('NRR')).toBe('1.1694')
  })

  it('links to the competition table when given one', () => {
    if (!ECC_ROW) throw new Error('test data needs a club row')
    renderWithIntl(
      <ClubStandingCard
        row={ECC_ROW}
        teamCount={8}
        competition={{
          title: 'BCV T20 Regionalliga Bayern 2026',
          href: '/standings/bcv-t20-regionalliga-bayern-2026',
        }}
      />,
    )

    expect(screen.getByRole('link', { name: 'BCV T20 Regionalliga Bayern 2026' })).toHaveAttribute(
      'href',
      '/standings/bcv-t20-regionalliga-bayern-2026',
    )
  })

  it('has no link on a competition page', () => {
    if (!ECC_ROW) throw new Error('test data needs a club row')
    renderWithIntl(<ClubStandingCard row={ECC_ROW} teamCount={8} />)

    expect(screen.queryByRole('link')).toBeNull()
  })
})
