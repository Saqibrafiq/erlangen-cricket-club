import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { PlayerDraft, SavePlayerResult } from '../../editor-types'
import { PlayerForm, type PlayerFormProps } from './player-form'

const DRAFT: PlayerDraft = {
  id: 7,
  name: 'Saqib Rafiq',
  photo: { url: '/api/media/file/saqib.webp', alt: 'Saqib Rafiq', width: 600, height: 720 },
  playingRole: 'bowler',
  battingStyle: 'right-hand',
  bowlingStyle: 'right-arm-fast',
  clubOffice: 'president',
  teams: [1],
  bio: 'Opening bowler.',
  isFeaturedOnHome: true,
  hasPublishConsent: true,
  consentNote: 'Membership form, 3 March 2026',
}
const TEAMS = [
  { id: 1, name: 'Erlangen Cricket Club I' },
  { id: 2, name: 'Erlangen Cricket Club II' },
]

const CUT_OUT = new File(['cut'], 'new.webp', { type: 'image/webp' })

function renderForm(props: Partial<PlayerFormProps> = {}) {
  const save = vi.fn((_formData: FormData): Promise<SavePlayerResult> =>
    Promise.resolve({ status: 'saved', player: { id: 7, slug: 'saqib-rafiq', isPublic: true } }),
  )
  const onSaved = vi.fn()
  renderWithIntl(
    <PlayerForm
      draft={DRAFT}
      teams={TEAMS}
      locale="en"
      loginHref="/login"
      save={save}
      onSaved={onSaved}
      onCancel={vi.fn()}
      cutOut={() => Promise.resolve(CUT_OUT)}
      {...props}
    />,
  )
  return { save, onSaved }
}

describe('PlayerForm', () => {
  it('shows the player as stored, ready to edit', () => {
    renderForm()

    expect(screen.getByLabelText('Name', { exact: true })).toHaveValue('Saqib Rafiq')
    expect(screen.getByLabelText('Role', { exact: true })).toHaveValue('bowler')
    expect(screen.getByLabelText('Bowling style')).toHaveValue('right-arm-fast')
    expect(screen.getByLabelText('Club office')).toHaveValue('president')
    expect(screen.getByLabelText('Erlangen Cricket Club I')).toBeChecked()
    expect(screen.getByLabelText('Erlangen Cricket Club II')).not.toBeChecked()
    expect(screen.getByLabelText('Agreed to appear on the website')).toBeChecked()
    expect(screen.getByLabelText('How consent was given')).toHaveValue(
      'Membership form, 3 March 2026',
    )
    // The styled label of the (visually hidden) file input.
    expect(screen.getByText('Change photo')).toBeInTheDocument()
  })

  it('sends the edited player and reports it saved', async () => {
    const { save, onSaved } = renderForm()

    await userEvent.clear(screen.getByLabelText('Name', { exact: true }))
    await userEvent.type(screen.getByLabelText('Name', { exact: true }), 'Saqib R.')
    await userEvent.selectOptions(screen.getByLabelText('Bowling style'), 'right-arm-off-spin')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(
        { id: 7, slug: 'saqib-rafiq', isPublic: true },
        'Saqib R.',
      )
    })
    const formData = save.mock.calls[0]?.[0]
    expect(formData?.get('id')).toBe('7')
    expect(formData?.get('bowlingStyle')).toBe('right-arm-off-spin')
    expect(formData?.getAll('teams')).toEqual(['1'])
  })

  it('starts empty for a new player, asking for consent details only once ticked', async () => {
    renderForm({ draft: null })

    expect(screen.getByLabelText('Name', { exact: true })).toHaveValue('')
    expect(screen.getByText('Choose photo')).toBeInTheDocument()
    expect(screen.getByText('No photo yet: the card shows initials.')).toBeInTheDocument()
    expect(screen.queryByLabelText('How consent was given')).toBeNull()

    await userEvent.click(screen.getByLabelText('Agreed to appear on the website'))

    expect(screen.getByLabelText('How consent was given')).toBeInTheDocument()
  })

  it('marks invalid fields from the server and focuses the first one', async () => {
    renderForm({
      save: () => Promise.resolve({ status: 'invalid', fieldErrors: { name: 'duplicateName' } }),
    })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please check the highlighted fields.',
    )
    const name = screen.getByLabelText('Name', { exact: true })
    await waitFor(() => {
      expect(name).toHaveFocus()
    })
    expect(name).toHaveAccessibleDescription('A player with this name already exists.')
  })

  it('offers to sign in again when the session has ended', async () => {
    renderForm({ save: () => Promise.resolve({ status: 'unauthorized' }) })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('link', { name: 'Sign in again' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('says when saving failed', async () => {
    renderForm({ save: () => Promise.resolve({ status: 'error' }) })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Saving is not possible/)
  })

  it('removes the background of a new photo, previews it and uploads the cut-out', async () => {
    const createObjectURL = vi.fn(() => 'blob:preview')
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() }))
    const { save } = renderForm()

    await userEvent.upload(
      screen.getByLabelText(/^Photo/),
      new File(['x'], 'new.png', { type: 'image/png' }),
    )

    expect(await screen.findByText(/Background removed/)).toBeInTheDocument()
    expect(createObjectURL).toHaveBeenCalledWith(CUT_OUT)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(save).toHaveBeenCalled()
    })
    expect(save.mock.calls[0]?.[0].get('photo')).toBe(CUT_OUT)
    vi.unstubAllGlobals()
  })

  it('waits for the background removal before saving, and says when it failed', async () => {
    vi.stubGlobal(
      'URL',
      Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() }),
    )
    let fail: (error: Error) => void = () => undefined
    renderForm({
      cutOut: () =>
        new Promise((_resolve, reject) => {
          fail = reject
        }),
    })

    await userEvent.upload(
      screen.getByLabelText(/^Photo/),
      new File(['x'], 'new.png', { type: 'image/png' }),
    )
    expect(screen.getByText(/Removing the background/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()

    fail(new Error('no person'))
    expect(await screen.findByText(/could not be removed automatically/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
    vi.unstubAllGlobals()
  })

  it('can remove the stored photo', async () => {
    renderForm()

    await userEvent.click(screen.getByLabelText('Remove photo'))

    expect(screen.getByLabelText(/^Photo/)).toBeDisabled()
    expect(screen.queryByLabelText('Remove background automatically')).toBeNull()
  })

  it('stays busy while the page refreshes after saving', () => {
    renderForm({ isFinishing: true })

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
  })
})
