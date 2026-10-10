import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CountUp } from './count-up'

describe('CountUp', () => {
  it('gives assistive technology the final value straight away', () => {
    render(<CountUp value={49} />)

    expect(screen.getByText('49', { selector: '.sr-only' })).toBeInTheDocument()
  })

  it('formats the value, e.g. as a percentage', () => {
    render(<CountUp value={0.55} format={(value) => `${String(Math.round(value * 100))}%`} />)

    expect(screen.getByText('55%', { selector: '.sr-only' })).toBeInTheDocument()
  })
})
