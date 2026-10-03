import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TeamMonogram } from './team-monogram'

describe('TeamMonogram', () => {
  it('shows the initials and is hidden from assistive technology', () => {
    const { container } = render(<TeamMonogram shortName="SDTCC-II" />)
    const monogram = container.firstElementChild

    expect(monogram).toHaveTextContent('SDT')
    expect(monogram).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses the brand colour for club teams', () => {
    const { container } = render(<TeamMonogram shortName="ECC-I" tone="club" />)

    expect(container.firstElementChild).toHaveClass('bg-brand-primary')
  })
})
