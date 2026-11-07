import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Disclosure } from './disclosure'

describe('Disclosure', () => {
  it('shows and hides its content with the button, telling assistive technology the state', async () => {
    render(<Disclosure summary="Payment terms">Fees are due in March.</Disclosure>)
    const button = screen.getByRole('button', { name: 'Payment terms' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Fees are due in March.')).toBeNull()

    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    // It fades in.
    await waitFor(() => {
      expect(screen.getByText('Fees are due in March.')).toBeVisible()
    })
    expect(button).toHaveAttribute('aria-controls', expect.stringContaining('panel') as string)

    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => {
      expect(screen.queryByText('Fees are due in March.')).toBeNull()
    })
  })

  it('can start open', () => {
    render(
      <Disclosure summary="Payment terms" defaultOpen>
        Fees are due in March.
      </Disclosure>,
    )
    expect(screen.getByRole('button', { name: 'Payment terms' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('Fees are due in March.')).toBeVisible()
  })
})
