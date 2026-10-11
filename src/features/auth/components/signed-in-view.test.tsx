import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { EditModeResult } from '../sign-in-state'
import { SignedInView } from './signed-in-view'

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderView(result: EditModeResult = { status: 'ok' }) {
  const enterEditMode = vi.fn(() => Promise.resolve(result))
  const signOut = vi.fn(() => Promise.resolve())
  renderWithIntl(
    <SignedInView
      email="saqib@example.com"
      redirectTo="/players"
      enterEditMode={enterEditMode}
      signOut={signOut}
    />,
  )
  return { enterEditMode, signOut }
}

describe('SignedInView', () => {
  it('says who is signed in', () => {
    renderView()

    expect(screen.getByRole('heading', { level: 1, name: 'You’re signed in' })).toBeInTheDocument()
    expect(screen.getByText('Signed in as saqib@example.com.')).toBeInTheDocument()
  })

  it('opens edit mode on the requested page', async () => {
    const { enterEditMode } = renderView()
    // After rendering: next/image reads the real location while it renders.
    const assign = vi.fn()
    vi.stubGlobal('location', { assign })

    await userEvent.click(screen.getByRole('button', { name: 'Open edit mode' }))

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('/players')
    })
    expect(enterEditMode).toHaveBeenCalledOnce()
  })

  it('explains when the session ended meanwhile', async () => {
    renderView({ status: 'unauthorized' })

    await userEvent.click(screen.getByRole('button', { name: 'Open edit mode' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Your session has just ended')
  })

  it('signs out and shows the sign-in form again', async () => {
    const { signOut } = renderView()
    const reload = vi.fn()
    vi.stubGlobal('location', { reload })

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(reload).toHaveBeenCalled()
    })
    expect(signOut).toHaveBeenCalledOnce()
  })
})
