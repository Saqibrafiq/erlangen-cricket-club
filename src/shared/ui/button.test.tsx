import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('calls onClick when activated with the keyboard', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Join the club</Button>)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('button', { name: 'Join the club' })).toHaveFocus()
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Join the club
      </Button>,
    )

    await user.click(screen.getByRole('button', { name: 'Join the club' }))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders its child element with button styling when asChild is set', () => {
    render(
      <Button asChild>
        <a href="#membership">Become a member</a>
      </Button>,
    )

    const link = screen.getByRole('link', { name: 'Become a member' })
    expect(link).toHaveAttribute('href', '#membership')
    expect(screen.queryByRole('button')).toBeNull()
  })
})
