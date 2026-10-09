import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Flag } from './flag'

describe('Flag', () => {
  it('is decorative, so screen readers read only the language name next to it', () => {
    const { container } = render(<Flag country="de" />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('gives every Union Jack its own clip path, so several can share a page', () => {
    const { container } = render(
      <>
        <Flag country="gb" />
        <Flag country="gb" />
      </>,
    )

    const ids = [...container.querySelectorAll('clipPath')].map((clip) => clip.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })
})
