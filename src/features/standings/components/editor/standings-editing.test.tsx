import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { ImportedStandingsRow } from '../../domain/standings-csv'
import type { StandingsEditing, StandingsEditorActions } from '../../editor-types'
import { StandingsOverview } from '../standings-overview'
import { StandingsEditingProvider } from './standings-editing'

const refresh = vi.fn()
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/standings',
}))

const EDITOR_LOAD_TIMEOUT_MS = 10_000
const HEADER = 'SNO,TEAM,MAT,WON,LOST,N/R,TIE,PTS,WIN%,NET RR,FOR,AGAINST'
const ECC_ROW = '1,ECC-I,14,9,3,0,2,80.0,75.00%,1.1694,1954/243.4,1596/233'
const SKCC_ROW = '2,SKCC,14,1,13,0,0,8.0,7.14%,-4.0217,1378/271,1624/178.2'

const CURRENT_ECC: ImportedStandingsRow = {
  teamShortName: 'ECC-I',
  played: 12,
  won: 7,
  lost: 3,
  noResult: 0,
  tied: 2,
  points: 64,
  winRate: 70,
  netRunRate: 1,
  runsFor: 1700,
  oversFaced: '210',
  runsAgainst: 1400,
  oversBowled: '200',
}

function csvFile(...rows: string[]): File {
  return new File([[HEADER, ...rows].join('\n')], 'viewPointsTableExcel.csv', {
    type: 'text/csv',
  })
}

function makeEditing(actions: Partial<StandingsEditorActions> = {}): StandingsEditing {
  return {
    loginHref: '/login',
    actions: {
      getImportData: vi.fn(() =>
        Promise.resolve({
          status: 'ok' as const,
          data: {
            competitions: [
              { id: 3, name: 'BCV Regionalliga Bayern', season: '2026', rows: [CURRENT_ECC] },
            ],
            teams: [{ id: 1, name: 'Erlangen CC I', shortName: 'ECC-I', isClubTeam: true }],
          },
        }),
      ),
      importStandings: vi.fn(() =>
        Promise.resolve({
          status: 'imported' as const,
          competition: { name: 'BCV Regionalliga Bayern', season: '2026', slug: 'bcv-2026' },
          teamCount: 2,
          teamsAdded: 1,
        }),
      ),
      ...actions,
    },
  }
}

function renderPage(editing = makeEditing()) {
  renderWithIntl(
    <StandingsEditingProvider editing={editing}>
      <StandingsOverview
        competitions={[
          {
            competition: {
              id: 3,
              slug: 'bcv-2026',
              name: 'BCV Regionalliga Bayern',
              season: '2026',
            },
            rows: [],
          },
        ]}
      />
    </StandingsEditingProvider>,
  )
  return editing
}

async function openImporter(buttonName: RegExp | string) {
  await userEvent.click(screen.getByRole('button', { name: buttonName }))
  return screen.findByRole('dialog', { name: 'Import table' }, { timeout: EDITOR_LOAD_TIMEOUT_MS })
}

afterEach(() => {
  document.cookie = `${EDIT_MODE_COOKIE}=; path=/; max-age=0`
  refresh.mockClear()
})

describe('importing standings', () => {
  it('shows visitors no import controls', () => {
    renderPage()

    expect(screen.queryByRole('button', { name: 'Import table' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Update table/ })).toBeNull()
  })

  it('previews the changes and the table, then imports and reports it', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    const editing = renderPage()

    const sheet = await openImporter('Update table BCV Regionalliga Bayern 2026')
    const competition = await within(sheet).findByLabelText('Competition')
    expect(competition).toHaveValue('3')
    expect(within(sheet).getByRole('button', { name: 'Import table' })).toBeDisabled()

    await userEvent.upload(
      within(sheet).getByLabelText(/^Points table \(CSV\)/),
      csvFile(ECC_ROW, SKCC_ROW),
    )

    expect(await within(sheet).findByText('2 changes')).toBeInTheDocument()
    expect(within(sheet).getByText('New team')).toBeInTheDocument()
    expect(within(sheet).getByText('+16 pts · 2 matches')).toBeInTheDocument()
    expect(within(sheet).getByRole('table')).toHaveTextContent('SKCC')

    await userEvent.click(within(sheet).getByRole('button', { name: 'Import table (2 teams)' }))

    await waitFor(() => {
      expect(editing.actions.importStandings).toHaveBeenCalledOnce()
    })
    const [sent] = vi.mocked(editing.actions.importStandings).mock.calls[0] ?? []
    expect(sent?.get('competition')).toBe('3')
    expect(sent?.get('csv')).toContain('SKCC')
    expect(refresh).toHaveBeenCalled()
    expect(
      await screen.findByText('BCV Regionalliga Bayern 2026 updated: 2 teams, 1 new team added.'),
    ).toBeInTheDocument()
  })

  it('lists every problem in a wrong file and keeps import disabled', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    renderPage()

    const sheet = await openImporter('Import table')
    await within(sheet).findByLabelText('Competition')
    await userEvent.upload(
      within(sheet).getByLabelText(/^Points table \(CSV\)/),
      csvFile('1,ECC-I,x,9,3,0,2,80.0,75.00%,1.1694,1954/243.4,1596/233'),
    )

    const alert = await within(sheet).findByRole('alert')
    expect(alert).toHaveTextContent('This file has 1 problem')
    expect(alert).toHaveTextContent('Line 2: MAT should be a whole number, not "x".')
    expect(within(sheet).getByRole('button', { name: 'Import table' })).toBeDisabled()
  })

  it('starts a new season and says when a table is already up to date', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    renderPage(
      makeEditing({
        importStandings: vi.fn(() =>
          Promise.resolve({
            status: 'invalid' as const,
            fieldErrors: { name: 'required' as const },
          }),
        ),
      }),
    )

    const sheet = await openImporter('Import table')
    await userEvent.selectOptions(
      await within(sheet).findByLabelText('Competition'),
      'New competition…',
    )
    expect(within(sheet).getByLabelText('Season')).toHaveValue(2027)
    expect(within(sheet).getByRole('radio', { name: '20 overs' })).toBeChecked()

    await userEvent.upload(within(sheet).getByLabelText(/^Points table \(CSV\)/), csvFile(ECC_ROW))
    await userEvent.click(
      await within(sheet).findByRole('button', { name: 'Import table (1 team)' }),
    )

    expect(await within(sheet).findByText('Please fill in this field.')).toBeInTheDocument()
  })
})
