import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { STANDINGS_ROWS } from '../test-factories'
import type { CompetitionStandings } from '../types'
import { StandingsOverview } from './standings-overview'
import { StandingsSkeleton } from './standings-skeleton'

const T20: CompetitionStandings = {
  competition: {
    id: 1,
    slug: 'bcv-t20-regionalliga-bayern-2026',
    name: 'BCV T20 Regionalliga Bayern',
    season: '2026',
  },
  rows: STANDINGS_ROWS,
}

describe('StandingsOverview', () => {
  it('shows each competition with a link to its page and its table', () => {
    renderWithIntl(<StandingsOverview competitions={[T20]} />)

    const section = screen.getByRole('region', { name: 'BCV T20 Regionalliga Bayern 2026' })
    expect(
      within(section).getByRole('link', { name: 'BCV T20 Regionalliga Bayern 2026' }),
    ).toHaveAttribute('href', '/standings/bcv-t20-regionalliga-bayern-2026')
    expect(within(section).getByRole('table')).toBeInTheDocument()
  })

  it('summarises the club teams first, linking to their tables', () => {
    renderWithIntl(<StandingsOverview competitions={[T20]} />)

    const ourTeams = screen.getByRole('region', { name: 'Our teams' })
    expect(within(ourTeams).getByRole('article')).toHaveTextContent('Erlangen Cricket Club I')
    expect(within(ourTeams).getByText('of 4 teams')).toBeInTheDocument()
  })

  it('shows an empty state for a competition whose table is not entered yet', () => {
    renderWithIntl(<StandingsOverview competitions={[{ ...T20, rows: [] }]} />)

    expect(screen.getByText(/has not been published yet/)).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('shows an empty state without competitions', () => {
    renderWithIntl(<StandingsOverview competitions={[]} />)

    expect(screen.getByText('No competitions yet.')).toBeInTheDocument()
  })
})

describe('StandingsSkeleton', () => {
  it('announces loading', () => {
    renderWithIntl(<StandingsSkeleton />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })
})
