import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'
import { VANISH_TIMEOUT_MS } from '@/shared/lib/use-vanishing'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { SponsorEditing, SponsorEditorActions } from '../../editor-types'
import { SPONSOR, TITLE_SPONSOR } from '../../test-factories'
import { SponsorsView } from '../sponsors-view'

const refresh = vi.fn()
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/sponsors',
}))

const EDITOR_LOAD_TIMEOUT_MS = 10_000

function makeEditing(actions: Partial<SponsorEditorActions> = {}): SponsorEditing {
  return {
    loginHref: '/login',
    actions: {
      getSponsor: vi.fn(() =>
        Promise.resolve({
          status: 'ok' as const,
          data: {
            id: SPONSOR.id,
            name: SPONSOR.name,
            logo: SPONSOR.logo,
            tier: SPONSOR.tier,
            since: SPONSOR.since,
            descriptionEn: SPONSOR.description,
            descriptionDe: 'Auf Deutsch.',
            website: SPONSOR.website,
            isActive: true,
          },
        }),
      ),
      getInactiveSponsors: vi.fn(() =>
        Promise.resolve({ status: 'ok' as const, data: [{ id: 9, name: 'Old Partner' }] }),
      ),
      saveSponsor: vi.fn(() =>
        Promise.resolve({ status: 'saved' as const, sponsor: { id: 12, isActive: true } }),
      ),
      deleteSponsor: vi.fn(() => Promise.resolve({ status: 'deleted' as const })),
      ...actions,
    },
  }
}

function renderView(editing = makeEditing()) {
  renderWithIntl(
    <SponsorsView sponsors={[TITLE_SPONSOR, SPONSOR]} contactHref="/contact" editing={editing} />,
  )
  return editing
}

function enterEditMode() {
  document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
}

afterEach(() => {
  document.cookie = `${EDIT_MODE_COOKIE}=; path=/; max-age=0`
  refresh.mockClear()
})

describe('sponsors in edit mode', () => {
  it('shows visitors the plain list, with no editing controls', () => {
    renderView()

    expect(screen.queryByRole('button', { name: 'Add sponsor' })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Edit / })).toBeNull()
  })

  it('gives editors a toolbar with past sponsors, and edit and delete on every card', async () => {
    enterEditMode()
    renderView()

    expect(screen.getByRole('button', { name: 'Add sponsor' })).toBeInTheDocument()
    expect(await screen.findByText('1 past sponsor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Edit ${TITLE_SPONSOR.name}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Delete ${SPONSOR.name}` })).toBeInTheDocument()
  })

  it('adds a sponsor with a live preview, then refreshes and reports it', async () => {
    enterEditMode()
    const editing = renderView()

    await userEvent.click(screen.getByRole('button', { name: 'Add sponsor' }))
    const sheet = await screen.findByRole(
      'dialog',
      { name: 'Add sponsor' },
      { timeout: EDITOR_LOAD_TIMEOUT_MS },
    )
    await userEvent.upload(
      within(sheet).getByLabelText(/^Logo/),
      new File([new Uint8Array(8)], 'logo.png', { type: 'image/png' }),
    )
    await userEvent.type(within(sheet).getByLabelText('Name'), 'Bäckerei Erlangen')
    await userEvent.click(within(sheet).getByRole('radio', { name: /Title sponsor/ }))
    await userEvent.type(within(sheet).getByLabelText('Description in English'), 'Fresh bread.')
    await userEvent.type(within(sheet).getByLabelText('Description in German'), 'Frisches Brot.')

    expect(
      within(sheet).getByRole('heading', { level: 3, hidden: true, name: 'Bäckerei Erlangen' }),
    ).toBeInTheDocument()

    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(editing.actions.saveSponsor).toHaveBeenCalledOnce()
    })
    const [sent] = vi.mocked(editing.actions.saveSponsor).mock.calls[0] ?? []
    expect(sent?.get('tier')).toBe('title')
    expect(sent?.get('logo')).toBeInstanceOf(File)
    expect(refresh).toHaveBeenCalled()
    expect(await screen.findByText('Bäckerei Erlangen saved.')).toBeInTheDocument()
  })

  it('shows the field errors the server returns', async () => {
    enterEditMode()
    renderView(
      makeEditing({
        saveSponsor: vi.fn(() =>
          Promise.resolve({
            status: 'invalid' as const,
            fieldErrors: { name: 'required' as const, logo: 'logoRequired' as const },
          }),
        ),
      }),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add sponsor' }))
    const sheet = await screen.findByRole(
      'dialog',
      { name: 'Add sponsor' },
      { timeout: EDITOR_LOAD_TIMEOUT_MS },
    )
    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }))

    expect(await within(sheet).findByText('Please check the highlighted fields.')).toBeVisible()
    expect(within(sheet).getByLabelText('Name')).toHaveAccessibleDescription(
      'Please fill in this field.',
    )
    expect(within(sheet).getByText('Please choose a logo.')).toBeInTheDocument()
  })

  it('loads a sponsor with both descriptions for editing', async () => {
    enterEditMode()
    renderView()

    await userEvent.click(screen.getByRole('button', { name: `Edit ${SPONSOR.name}` }))
    const sheet = await screen.findByRole(
      'dialog',
      { name: 'Edit sponsor' },
      { timeout: EDITOR_LOAD_TIMEOUT_MS },
    )

    expect(await within(sheet).findByLabelText('Name')).toHaveValue(SPONSOR.name)
    expect(within(sheet).getByLabelText('Description in German')).toHaveValue('Auf Deutsch.')
  })

  it('asks before deleting, lets the card vanish and reports the deletion', async () => {
    enterEditMode()
    const editing = renderView()

    await userEvent.click(screen.getByRole('button', { name: `Delete ${SPONSOR.name}` }))
    const dialog = await screen.findByRole(
      'alertdialog',
      { name: `Remove ${SPONSOR.name}?` },
      { timeout: EDITOR_LOAD_TIMEOUT_MS },
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(editing.actions.deleteSponsor).toHaveBeenCalledWith(SPONSOR.id)
    expect(
      await screen.findByText(`${SPONSOR.name} deleted.`, {}, { timeout: VANISH_TIMEOUT_MS }),
    ).toBeInTheDocument()
  })
})
