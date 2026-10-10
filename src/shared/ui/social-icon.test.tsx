import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SocialIcon } from './social-icon'

describe('SocialIcon', () => {
  it.each(['instagram', 'facebook'] as const)(
    'draws the %s glyph hidden from assistive technology',
    (network) => {
      const { container } = render(<SocialIcon network={network} />)

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg?.childElementCount).toBeGreaterThan(0)
    },
  )

  it('merges custom class names', () => {
    const { container } = render(<SocialIcon network="instagram" className="size-8" />)

    expect(container.querySelector('svg')).toHaveClass('size-8')
  })
})
