import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { Alert, RetryAlert, SignInRequiredAlert } from './alert'

describe('Alert', () => {
  it('announces its message to screen readers', () => {
    renderWithIntl(<Alert>The photo is too large.</Alert>)

    expect(screen.getByRole('alert')).toHaveTextContent('The photo is too large.')
  })
})

describe('SignInRequiredAlert', () => {
  it('links to signing in again', () => {
    renderWithIntl(
      <SignInRequiredAlert
        message="Your session has ended."
        signInLabel="Sign in again"
        signInHref="/login?next=/players"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Your session has ended.')
    expect(screen.getByRole('link', { name: 'Sign in again' })).toHaveAttribute(
      'href',
      '/login?next=/players',
    )
  })
})

describe('RetryAlert', () => {
  it('tries again when the button is pressed', async () => {
    const onRetry = vi.fn()
    renderWithIntl(
      <RetryAlert
        message="The player could not be loaded."
        retryLabel="Try again"
        onRetry={onRetry}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByRole('alert')).toHaveTextContent('The player could not be loaded.')
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
