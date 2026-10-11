import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { EditorBar } from './editor-bar'

afterEach(() => {
  document.cookie = `${EDIT_MODE_COOKIE}=; path=/; max-age=0`
  vi.unstubAllGlobals()
})

describe('EditorBar', () => {
  it('is invisible to visitors', () => {
    const { container } = renderWithIntl(<EditorBar signOut={vi.fn()} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('tells editors that edit mode is on and links to the full admin', () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    renderWithIntl(<EditorBar signOut={vi.fn()} />)

    expect(screen.getByText(/Edit mode/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Admin panel' })).toHaveAttribute('href', '/admin')
  })

  it('signs out and reloads the page as a visitor', async () => {
    document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })
    const signOut = vi.fn(() => Promise.resolve())
    renderWithIntl(<EditorBar signOut={signOut} />)

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(reload).toHaveBeenCalled()
    })
    expect(signOut).toHaveBeenCalledOnce()
  })
})
