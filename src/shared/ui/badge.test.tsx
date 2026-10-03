import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from './badge'

describe('Badge', () => {
  it('renders its label as text', () => {
    render(<Badge>Won</Badge>)

    expect(screen.getByText('Won')).toBeInTheDocument()
  })

  it('applies the variant styling', () => {
    render(<Badge variant="danger">Lost</Badge>)

    expect(screen.getByText('Lost')).toHaveClass('bg-status-danger-surface')
  })

  it('merges custom class names', () => {
    render(<Badge className="uppercase">Final</Badge>)

    expect(screen.getByText('Final')).toHaveClass('uppercase', 'rounded-full')
  })
})
