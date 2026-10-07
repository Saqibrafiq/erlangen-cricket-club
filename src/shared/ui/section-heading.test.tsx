import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SectionHeading } from './section-heading'

describe('SectionHeading', () => {
  it('renders a level-two heading with its eyebrow and intro', () => {
    render(
      <SectionHeading
        id="fees-heading"
        eyebrow="Fees"
        heading="Choose your membership"
        intro="Annual fees."
      />,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Choose your membership' }),
    ).toHaveAttribute('id', 'fees-heading')
    expect(screen.getByText('Fees')).toBeInTheDocument()
    expect(screen.getByText('Annual fees.')).toBeInTheDocument()
  })

  it('leaves out the intro when there is none', () => {
    const { container } = render(<SectionHeading id="x" eyebrow="Fees" heading="Fees" />)

    expect(container.querySelectorAll('p')).toHaveLength(1)
  })
})
