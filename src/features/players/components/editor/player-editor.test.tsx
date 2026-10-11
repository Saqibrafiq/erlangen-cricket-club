import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { PlayerEditing, PlayerEditorActions } from '../../editor-types'
import { PlayerEditor, type PlayerEditorProps } from './player-editor'

const refresh = vi.fn()
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/players',
}))

function makeEditing(actions: Partial<PlayerEditorActions> = {}): PlayerEditing {
  return {
    loginHref: '/login',
    actions: {
      getEditorData: vi.fn(() =>
        Promise.resolve({
          status: 'ok' as const,
          data: { draft: null, teams: [{ id: 1, name: 'Erlangen Cricket Club I' }] },
        }),
      ),
      getHiddenPlayers: vi.fn(() => Promise.resolve({ status: 'ok' as const, data: [] })),
      savePlayer: vi.fn(() =>
        Promise.resolve({
          status: 'saved' as const,
          player: { id: 9, slug: 'new-player', isPublic: false },
        }),
      ),
      deletePlayer: vi.fn(() => Promise.resolve({ status: 'deleted' as const })),
      ...actions,
    },
  }
}

function renderEditor(props: Partial<PlayerEditorProps> & Pick<PlayerEditorProps, 'intent'>) {
  const callbacks = { onClose: vi.fn(), onSaved: vi.fn(), onDeleted: vi.fn() }
  renderWithIntl(<PlayerEditor editing={makeEditing()} {...callbacks} {...props} />)
  return callbacks
}

describe('PlayerEditor', () => {
  beforeEach(() => {
    refresh.mockClear()
  })

  it('loads the form for a new player, then saves and refreshes the page', async () => {
    const { onSaved } = renderEditor({ intent: { kind: 'add' } })

    expect(screen.getByRole('dialog', { name: 'Add player' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading player…' })).toBeInTheDocument()

    await userEvent.type(await screen.findByLabelText('Name', { exact: true }), 'New Player')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith(
        { id: 9, slug: 'new-player', isPublic: false },
        'New Player',
      )
    })
    expect(refresh).toHaveBeenCalled()
  })

  it('loads the player to edit', async () => {
    const getEditorData = vi.fn(() => Promise.resolve({ status: 'error' as const }))
    renderWithIntl(
      <PlayerEditor
        intent={{ kind: 'edit', id: 7 }}
        editing={makeEditing({ getEditorData })}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )

    expect(screen.getByRole('dialog', { name: 'Edit player' })).toBeInTheDocument()
    expect(getEditorData).toHaveBeenCalledWith(7, 'en')
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded')

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(getEditorData).toHaveBeenCalledTimes(2)
  })

  it('asks to sign in again when the session has ended', async () => {
    renderWithIntl(
      <PlayerEditor
        intent={{ kind: 'add' }}
        editing={makeEditing({
          getEditorData: () => Promise.resolve({ status: 'unauthorized' }),
        })}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )

    expect(await screen.findByRole('link', { name: 'Sign in again' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('closes from the close button', async () => {
    const { onClose } = renderEditor({ intent: { kind: 'add' } })

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('asks before deleting, then deletes and refreshes the page', async () => {
    const { onDeleted } = renderEditor({ intent: { kind: 'delete', id: 7, name: 'Arun' } })

    expect(screen.getByRole('alertdialog', { name: 'Remove Arun?' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(onDeleted).toHaveBeenCalledWith('Arun')
    })
    expect(refresh).toHaveBeenCalled()
  })

  it('keeps the delete dialog open with a message when deleting fails', async () => {
    renderWithIntl(
      <PlayerEditor
        intent={{ kind: 'delete', id: 7, name: 'Arun' }}
        editing={makeEditing({ deletePlayer: () => Promise.resolve({ status: 'unauthorized' }) })}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        onDeleted={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Your session has ended')
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })
})
