import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { FixtureEditing, FixtureEditorActions } from '../../editor-types'
import { VANISH_TIMEOUT_MS } from '@/shared/lib/use-vanishing'

import { FixtureEditable, FixturesEditingProvider } from './fixtures-editing'

const refresh = vi.fn()
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/fixtures',
}))

const EDITOR_LOAD_TIMEOUT_MS = 10_000
// A flow loads the importer on demand, then fills and saves it: longer than one wait.
const FLOW_TIMEOUT_MS = 3 * EDITOR_LOAD_TIMEOUT_MS
const HEADER = 'Date,Time,Home,Away,Ground,Address,Stage'

function csvFile(...rows: string[]): File {
  return new File([[HEADER, ...rows].join('\n')], 'fixtures-2027.csv', { type: 'text/csv' })
}

function makeEditing(actions: Partial<FixtureEditorActions> = {}): FixtureEditing {
  return {
    loginHref: '/login',
    actions: {
      getImportData: vi.fn(() =>
        Promise.resolve({
          status: 'ok' as const,
          data: {
            competitions: [
              {
                id: 7,
                name: 'BCV Regionalliga Bayern',
                season: '2027',
                fixtures: [
                  {
                    id: 50,
                    key: 'ECC-I|NCC-I|1',
                    day: '2027-05-16',
                    startTime: '13:00',
                    homeShortName: 'ECC-I',
                    awayShortName: 'NCC-I',
                    groundName: 'Erlangen Cricket Ground',
                    stage: 'league' as const,
                    status: 'scheduled' as const,
                  },
                ],
              },
              { id: 1, name: 'BCV Regionalliga Bayern', season: '2026', fixtures: [] },
            ],
            teams: ['ECC-I', 'NCC-I'],
            grounds: [
              {
                name: 'Erlangen Cricket Ground',
                address: 'Siedlerstraße 1, 91056 Erlangen',
                clubCode: 'ECC',
              },
            ],
          },
        }),
      ),
      importFixtures: vi.fn(() =>
        Promise.resolve({
          status: 'imported' as const,
          competition: { name: 'BCV Regionalliga Bayern', season: '2027' },
          created: 1,
          updated: 1,
          removed: 0,
          teamsAdded: 1,
          groundsAdded: 1,
        }),
      ),
      getFixture: vi.fn(() =>
        Promise.resolve({
          status: 'ok' as const,
          data: {
            draft: {
              id: 60,
              title: 'ECC-I v NCC-I',
              day: '2027-05-16',
              startTime: '11:00',
              groundId: 3,
              stage: 'league' as const,
              status: 'scheduled' as const,
            },
            grounds: [
              { id: 3, name: 'Erlangen Cricket Ground' },
              { id: 4, name: 'Taufkirchen' },
            ],
          },
        }),
      ),
      saveFixture: vi.fn(() => Promise.resolve({ status: 'saved' as const })),
      deleteFixture: vi.fn(() => Promise.resolve({ status: 'deleted' as const })),
      ...actions,
    },
  }
}

function renderPage(editing = makeEditing()) {
  renderWithIntl(
    <FixturesEditingProvider editing={editing}>
      <p>Fixtures list</p>
      <FixtureEditable id={60} title="ECC-I v NCC-I">
        <article>ECC-I v NCC-I, 16 May</article>
      </FixtureEditable>
    </FixturesEditingProvider>,
  )
  return editing
}

async function openImporter() {
  await userEvent.click(screen.getByRole('button', { name: 'Import fixtures' }))
  const sheet = await screen.findByRole(
    'dialog',
    { name: 'Import fixtures' },
    { timeout: EDITOR_LOAD_TIMEOUT_MS },
  )
  await within(sheet).findByLabelText('Competition')
  return sheet
}

afterEach(() => {
  document.cookie = `${EDIT_MODE_COOKIE}=; path=/; max-age=0`
  refresh.mockClear()
})

describe('importing fixtures', { timeout: FLOW_TIMEOUT_MS }, () => {
  it('shows visitors only the fixtures', () => {
    renderPage()

    expect(screen.getByText('Fixtures list')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Import fixtures' })).toBeNull()
  })

  it('offers only the current season and a template to download', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    renderPage()

    const sheet = await openImporter()

    const options = within(within(sheet).getByLabelText('Competition')).getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      'BCV Regionalliga Bayern 2027',
      'New competition…',
    ])
    expect(within(sheet).getByRole('link', { name: /Download the template/ })).toHaveAttribute(
      'download',
      'ecc-fixtures-template.csv',
    )
  })

  it('previews new and rescheduled fixtures, then imports and reports it', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    const editing = renderPage()

    const sheet = await openImporter()
    await userEvent.upload(
      within(sheet).getByLabelText(/^Schedule \(CSV\)/),
      csvFile(
        // No ground: ECC-I plays at home, at the Erlangen Cricket Ground.
        '16.05.2027,11:00,ECC-I,NCC-I,,,League',
        '23.05.2027,,SKCC,ECC-I,Tennenlohe,,',
      ),
    )

    expect(await within(sheet).findByText('1 new · 1 changed · 0 removed')).toBeInTheDocument()
    expect(within(sheet).getByText('Changed: time')).toBeInTheDocument()
    expect(within(sheet).getByText('Erlangen Cricket Ground · home ground')).toBeInTheDocument()
    expect(within(sheet).getByText('New teams: SKCC. New grounds: Tennenlohe.')).toBeInTheDocument()

    await userEvent.click(within(sheet).getByRole('button', { name: 'Import 2 fixtures' }))

    await waitFor(() => {
      expect(editing.actions.importFixtures).toHaveBeenCalledOnce()
    })
    const [sent] = vi.mocked(editing.actions.importFixtures).mock.calls[0] ?? []
    expect(sent?.get('competition')).toBe('7')
    expect(sent?.get('csv')).toContain('SKCC')
    expect(refresh).toHaveBeenCalled()
    expect(
      await screen.findByText(
        'BCV Regionalliga Bayern 2027: 1 new, 1 changed, 0 removed, 2 new teams and grounds added.',
      ),
    ).toBeInTheDocument()
  })

  it('lists every problem in a wrong file and keeps import disabled', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    renderPage()

    const sheet = await openImporter()
    await userEvent.upload(
      within(sheet).getByLabelText(/^Schedule \(CSV\)/),
      csvFile('soon,11:00,ECC-I,ECC-I,,,'),
    )

    const alert = await within(sheet).findByRole('alert')
    expect(alert).toHaveTextContent('This file has 2 problems')
    expect(alert).toHaveTextContent('Line 2: DATE should be a date like 16.05.2027, not "soon".')
    expect(within(sheet).getByRole('button', { name: 'Import fixtures' })).toBeDisabled()
  })

  it("edits a fixture's time and ground, then reports it", async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    const editing = renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Edit ECC-I v NCC-I' }))
    const sheet = await screen.findByRole(
      'dialog',
      { name: 'Edit ECC-I v NCC-I' },
      { timeout: EDITOR_LOAD_TIMEOUT_MS },
    )
    expect(await within(sheet).findByLabelText('Date')).toHaveValue('2027-05-16')
    await userEvent.selectOptions(within(sheet).getByLabelText(/^Ground/), 'Taufkirchen')
    await userEvent.selectOptions(within(sheet).getByLabelText('Status'), 'Cancelled')
    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(editing.actions.saveFixture).toHaveBeenCalledOnce()
    })
    const [sent] = vi.mocked(editing.actions.saveFixture).mock.calls[0] ?? []
    expect(sent?.get('id')).toBe('60')
    expect(sent?.get('ground')).toBe('4')
    expect(sent?.get('status')).toBe('cancelled')
    expect(await screen.findByText('ECC-I v NCC-I saved.')).toBeInTheDocument()
  })

  it('asks before deleting a fixture, lets it vanish and reports it', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    const editing = renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Delete ECC-I v NCC-I' }))
    const dialog = await screen.findByRole(
      'alertdialog',
      { name: 'Delete ECC-I v NCC-I?' },
      { timeout: EDITOR_LOAD_TIMEOUT_MS },
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(editing.actions.deleteFixture).toHaveBeenCalledWith(60)
    expect(
      await screen.findByText('ECC-I v NCC-I deleted.', {}, { timeout: VANISH_TIMEOUT_MS }),
    ).toBeInTheDocument()
  })
})
