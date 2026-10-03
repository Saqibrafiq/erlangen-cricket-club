import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import ErrorPage from './error'

describe('ErrorPage', () => {
  it('announces the error without exposing details', () => {
    renderWithIntl(<ErrorPage error={new Error('database down')} reset={vi.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.queryByText(/database down/)).toBeNull()
  })

  it('retries when the user activates the button', async () => {
    const user = userEvent.setup()
    const reset = vi.fn()
    renderWithIntl(<ErrorPage error={new Error('boom')} reset={reset} />)

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(reset).toHaveBeenCalledOnce()
  })
})
