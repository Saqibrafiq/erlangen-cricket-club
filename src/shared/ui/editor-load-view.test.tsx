import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { EditorLoadState } from '@/shared/lib/use-editor-load'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { EditorLoadView } from './editor-load-view'

function renderView(state: EditorLoadState<string>, onRetry = vi.fn()) {
  renderWithIntl(
    <EditorLoadView
      state={state}
      skeleton={<p>Loading the player…</p>}
      loadError="The player could not be loaded."
      signInHref="/login"
      onRetry={onRetry}
    >
      {(name) => <p>Editing {name}</p>}
    </EditorLoadView>,
  )
}

describe('EditorLoadView', () => {
  it('shows the skeleton while loading', () => {
    renderView({ status: 'loading' })

    expect(screen.getByText('Loading the player…')).toBeInTheDocument()
  })

  it('shows the form with its data once loaded', () => {
    renderView({ status: 'ok', data: 'Saqib Rafiq' })

    expect(screen.getByText('Editing Saqib Rafiq')).toBeInTheDocument()
  })

  it('asks to sign in again when the session has ended', () => {
    renderView({ status: 'unauthorized' })

    expect(screen.getByRole('link', { name: 'Sign in again' })).toHaveAttribute('href', '/login')
  })

  it('offers to try again when loading failed', async () => {
    const onRetry = vi.fn()
    renderView({ status: 'error' }, onRetry)

    expect(screen.getByRole('alert')).toHaveTextContent('The player could not be loaded.')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
