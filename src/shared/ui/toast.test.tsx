import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { toast, toastAfterReload, Toaster } from './toast'

// Short enough for a test, long enough to see the toast first.
const SHORT_DURATION_MS = 50

afterEach(() => {
  sessionStorage.clear()
})

describe('Toaster', () => {
  it('announces a toast politely and closes it on request', async () => {
    render(<Toaster closeLabel="Close" />)

    act(() => {
      toast('Profile saved.')
    })

    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveTextContent('Profile saved.')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await vi.waitFor(() => {
      expect(screen.queryByText('Profile saved.')).toBeNull()
    })
  })

  it('closes a toast by itself after its time', async () => {
    render(<Toaster closeLabel="Close" duration={SHORT_DURATION_MS} />)

    act(() => {
      toast('You are signed out.')
    })
    expect(screen.getByText('You are signed out.')).toBeInTheDocument()

    await vi.waitFor(() => {
      expect(screen.queryByText('You are signed out.')).toBeNull()
    })
  })

  it('shows a message queued before a page reload once, on the next load', () => {
    toastAfterReload('You are signed in.')

    const { unmount } = render(<Toaster closeLabel="Close" />)
    expect(screen.getByText('You are signed in.')).toBeInTheDocument()
    unmount()

    render(<Toaster closeLabel="Close" />)
    expect(sessionStorage.getItem('ecc-toast')).toBeNull()
  })
})
