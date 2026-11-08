import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PressableButton } from './pressable-button'

describe('PressableButton', () => {
  it('is a native button that reacts to clicks', async () => {
    const onClick = vi.fn()
    render(
      <PressableButton type="button" onClick={onClick}>
        Save
      </PressableButton>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('cannot be pressed while disabled', async () => {
    const onClick = vi.fn()
    render(
      <PressableButton type="button" disabled onClick={onClick}>
        Save
      </PressableButton>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
