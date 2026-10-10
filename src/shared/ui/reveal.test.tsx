import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Reveal } from './reveal'

describe('Reveal', () => {
  it('renders its content with the given class names', () => {
    render(
      <Reveal className="space-y-4">
        <p>Season 2026</p>
      </Reveal>,
    )

    const content = screen.getByText('Season 2026')
    expect(content).toBeInTheDocument()
    expect(content.parentElement).toHaveClass('space-y-4')
  })
})
