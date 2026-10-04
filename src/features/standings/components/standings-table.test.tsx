import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { STANDINGS_ROWS } from '../test-factories'
import { StandingsTable } from './standings-table'

const CAPTION = 'BCV T20 Regionalliga Bayern 2026'

const TEAM_NAMES = STANDINGS_ROWS.map((row) => row.team.name)

/** Team names in displayed row order (exact match, so the monograms "NCC", "TSV" … don't count). */
function teamOrder(): string[] {
  return screen
    .getAllByRole('rowheader')
    .map((cell) => TEAM_NAMES.find((name) => within(cell).queryAllByText(name).length > 0))
    .filter((name) => name !== undefined)
}

describe('StandingsTable', () => {
  it('is a captioned table with teams as row headers', () => {
    renderWithIntl(<StandingsTable rows={STANDINGS_ROWS} caption={CAPTION} />)

    expect(screen.getByRole('table', { name: CAPTION })).toBeInTheDocument()
    expect(teamOrder()).toEqual(['TSVGC', 'Erlangen Cricket Club I', 'SDTCC-I', 'NCC-I'])
  })

  it('shows win rate, net run rate and runs over overs as published', () => {
    renderWithIntl(<StandingsTable rows={STANDINGS_ROWS} caption={CAPTION} />)

    const ecc = screen.getByRole('row', { name: /Erlangen Cricket Club I/ })
    expect(within(ecc).getByText('71.43%')).toBeInTheDocument()
    expect(within(ecc).getByText('1.1694')).toBeInTheDocument()
    expect(
      within(ecc)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toContain('1954/243.4')
  })

  it('names abbreviated column headers by their full name', () => {
    renderWithIntl(<StandingsTable rows={STANDINGS_ROWS} caption={CAPTION} />)

    expect(screen.getByRole('columnheader', { name: 'Net run rate' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('lets keyboard users reach the scrollable table', () => {
    renderWithIntl(<StandingsTable rows={STANDINGS_ROWS} caption={CAPTION} />)

    expect(screen.getByRole('region', { name: `${CAPTION} table` })).toHaveAttribute(
      'tabindex',
      '0',
    )
  })

  it('highlights the club row', () => {
    renderWithIntl(<StandingsTable rows={STANDINGS_ROWS} caption={CAPTION} />)

    const ecc = screen.getByRole('row', { name: /Erlangen Cricket Club I/ })
    expect(within(ecc).getByRole('rowheader')).toHaveClass('bg-surface-highlight')
  })
})
