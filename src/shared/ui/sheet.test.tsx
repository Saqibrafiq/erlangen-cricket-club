import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Sheet } from './sheet'

describe('Sheet', () => {
  it('is a named dialog with its description', () => {
    render(
      <Sheet
        open
        onOpenChange={vi.fn()}
        title="Edit player"
        description="Changes are visible immediately."
        closeLabel="Close"
      >
        <label>
          Name <input />
        </label>
      </Sheet>,
    )

    expect(screen.getByRole('dialog', { name: 'Edit player' })).toHaveAccessibleDescription(
      'Changes are visible immediately.',
    )
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('asks to close from the close button and with Escape', async () => {
    const onOpenChange = vi.fn()
    render(
      <Sheet open onOpenChange={onOpenChange} title="Edit player" closeLabel="Close">
        content
      </Sheet>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await userEvent.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledTimes(2)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders nothing while closed', () => {
    render(
      <Sheet open={false} onOpenChange={vi.fn()} title="Edit player" closeLabel="Close">
        content
      </Sheet>,
    )

    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
