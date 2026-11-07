import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { PlayerEditing } from '../editor-types'
import { PLAYER_SEASONS } from '../test-factories'
import { CareerStats } from './career-stats'

const editMode = vi.hoisted(() => ({ isOn: false }))
vi.mock('@/shared/lib/edit-mode', () => ({ useIsEditMode: () => editMode.isOn }))

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

function makeEditing(): PlayerEditing {
  return {
    loginHref: '/login',
    actions: {
      getEditorData: vi.fn(),
      getHiddenPlayers: vi.fn(),
      savePlayer: vi.fn(),
      deletePlayer: vi.fn(),
      getSeasonEditorData: vi.fn(() =>
        Promise.resolve({ status: 'ok' as const, data: { draft: null, teams: [] } }),
      ),
      saveSeason: vi.fn(),
      deleteSeason: vi.fn(() => Promise.resolve({ status: 'deleted' as const })),
    },
  }
}

function renderStats(editing?: PlayerEditing) {
  renderWithIntl(
    <CareerStats
      playerId={3}
      playerName="Karan Chadha"
      seasons={PLAYER_SEASONS}
      editing={editing}
    />,
  )
  return within(screen.getByRole('region', { name: 'Career stats' }))
}

/** The cells of a table row, as read (screen-reader text where the visible text is abbreviated). */
function rowCells(table: HTMLElement, heading: string | RegExp): string[] {
  const row = within(table).getByRole('rowheader', { name: heading }).closest('tr')
  return within(row ?? table)
    .getAllByRole('cell')
    .filter((cell) => !cell.querySelector('button'))
    .map((cell) => cell.querySelector('.sr-only')?.textContent ?? cell.textContent)
}

afterEach(() => {
  editMode.isOn = false
})

describe('CareerStats', () => {
  it('shows the club career in headline figures', () => {
    const stats = renderStats()
    const figures = stats.getAllByRole('definition').map((value) => value.textContent)

    // Matches 25 + 25; runs 501 + 439; wickets 56 + 31; highest score 83 not out (2025).
    expect(figures).toEqual(['50', '940', '87', '83*83 not out'])
  })

  it('lists batting by season with calculated rates and career totals', () => {
    const stats = renderStats()
    const batting = stats.getByRole('region', { name: 'Batting' })

    // M, Inn, NO, Runs, BF, Avg, SR, HS, 100s, 50s, 4s, 6s.
    expect(rowCells(batting, /^2026/)).toEqual([
      '25',
      '18',
      '4',
      '501',
      '391',
      '35.79',
      '128.13',
      '76',
      '0',
      '3',
      '56',
      '26',
    ])
    // 940 runs over 32 dismissals; 940 from 788 balls; best score 83 not out.
    expect(rowCells(batting, 'Career')).toEqual([
      '50',
      '40',
      '8',
      '940',
      '788',
      '29.38',
      '119.29',
      '83 not out',
      '0',
      '5',
      '93',
      '48',
    ])
  })

  it('lists bowling with overs, best figures, average, economy and strike rate', () => {
    const stats = renderStats()
    const bowling = stats.getByRole('region', { name: 'Bowling' })

    // M, Inn, O, Mdns, Runs, Wkts, Best, Avg, Econ, SR, 4w, 5w.
    expect(rowCells(bowling, /^2026/)).toEqual([
      '25',
      '25',
      '110.1',
      '5',
      '682',
      '56',
      '6/12',
      '12.18',
      '6.19',
      '11.80',
      '3',
      '1',
    ])
    expect(rowCells(bowling, 'Career').slice(2, 10)).toEqual([
      '217.3',
      '7',
      '1,344',
      '87',
      '6/12',
      '15.45',
      '6.18',
      '15.00',
    ])
  })

  it('opens a season to show each team’s figures, the friendlies and the district team', async () => {
    const stats = renderStats()
    const batting = stats.getByRole('region', { name: 'Batting' })
    const toggle = within(batting).getByRole('button', { name: '2026: show teams' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(batting).queryByRole('rowheader', { name: 'Erlangen Cricket Club I' })).toBeNull()

    await userEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(rowCells(batting, 'Erlangen Cricket Club I').slice(0, 4)).toEqual([
      '11',
      '8',
      '2',
      '240',
    ])
    expect(rowCells(batting, 'Erlangen Cricket Club II').slice(0, 4)).toEqual([
      '13',
      '9',
      '2',
      '230',
    ])
    // The season less both teams' league matches: 1 match, 31 runs from 21 balls, no best score.
    expect(rowCells(batting, 'Friendlies & other')).toEqual([
      '1',
      '1',
      '0',
      '31',
      '21',
      '31.00',
      '147.62',
      'not applicable',
      '0',
      '0',
      '3',
      '2',
    ])
    expect(rowCells(batting, /District team/).slice(0, 4)).toEqual(['6', '6', '0', '60'])
    // The district team is not part of the career row.
    expect(rowCells(batting, 'Career')[3]).toBe('940')
  })

  it('works out the friendlies’ bowling from the season less the teams', async () => {
    const stats = renderStats()
    const bowling = stats.getByRole('region', { name: 'Bowling' })

    await userEvent.click(within(bowling).getByRole('button', { name: '2026: show teams' }))

    // 21 balls, 22 runs, 2 wickets; no district bowling that season.
    expect(rowCells(bowling, 'Friendlies & other').slice(0, 10)).toEqual([
      '1',
      '1',
      '3.3',
      '0',
      '22',
      '2',
      'not applicable',
      '11.00',
      '6.29',
      '10.50',
    ])
    expect(within(bowling).queryByRole('rowheader', { name: /District team/ })).toBeNull()
  })

  it('switches between all matches and the T20 part of the record', async () => {
    const stats = renderStats()
    expect(stats.getByText(/All matches includes friendlies/)).toBeVisible()

    await userEvent.click(stats.getByRole('radio', { name: 'T20' }))

    const figures = stats.getAllByRole('definition').map((value) => value.textContent)
    expect(figures).toEqual(['17', '301', '36', '66'])
    // Teams and the district team belong to all matches only.
    expect(stats.queryByRole('button', { name: /show teams/ })).toBeNull()
    expect(stats.queryByText(/All matches includes friendlies/)).toBeNull()
  })

  it('shows no editing controls to visitors', () => {
    const stats = renderStats(makeEditing())
    expect(stats.queryByRole('button', { name: 'Add season' })).toBeNull()
  })

  it('lets editors add a season and edit or delete each one', async () => {
    editMode.isOn = true
    const editing = makeEditing()
    const stats = renderStats(editing)

    await userEvent.click(stats.getByRole('button', { name: 'Add season' }))
    expect(editing.actions.getSeasonEditorData).toHaveBeenCalledWith(3, null)
    expect(await screen.findByRole('dialog', { name: 'Add a season' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    const batting = within(stats.getByRole('region', { name: 'Batting' }))
    await userEvent.click(
      batting.getByRole('button', { name: 'Delete season 2025 · Club · All matches' }),
    )
    const dialog = await screen.findByRole('alertdialog', {
      name: 'Delete season 2025 · Club · All matches?',
    })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete season' }))
    expect(editing.actions.deleteSeason).toHaveBeenCalledWith(102)
  })
})
