import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton className="h-4" />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts sizing classes', () => {
    const { container } = render(<Skeleton className="h-24 w-full" />)

    expect(container.firstElementChild).toHaveClass('h-24', 'w-full', 'animate-pulse')
  })
})
