import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { VANISH_TIMEOUT_MS } from '@/shared/lib/use-vanishing'

import { Vanish } from './vanish'

describe('Vanish', () => {
  it('shows its content until it vanishes', () => {
    render(
      <Vanish isVanishing={false}>
        <p>mein-banker</p>
      </Vanish>,
    )

    expect(screen.getByText('mein-banker')).toBeVisible()
    expect(screen.getByText('mein-banker').parentElement).not.toHaveAttribute('aria-hidden')
  })

  it('hides the content from assistive technology and reports when it is gone', async () => {
    const onVanished = vi.fn()
    const { rerender } = render(
      <Vanish isVanishing={false} onVanished={onVanished}>
        <p>mein-banker</p>
      </Vanish>,
    )

    rerender(
      <Vanish isVanishing onVanished={onVanished}>
        <p>mein-banker</p>
      </Vanish>,
    )

    expect(screen.getByText('mein-banker').parentElement).toHaveAttribute('aria-hidden', 'true')
    await waitFor(
      () => {
        expect(onVanished).toHaveBeenCalledOnce()
      },
      { timeout: VANISH_TIMEOUT_MS },
    )
  })
})
