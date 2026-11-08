import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ScrollRegion } from './scroll-region'

describe('ScrollRegion', () => {
  it('is a named region keyboard users can focus', () => {
    render(
      <ScrollRegion label="Batting by season">
        <table />
      </ScrollRegion>,
    )

    const region = screen.getByRole('region', { name: 'Batting by season' })
    expect(region).toHaveAttribute('tabindex', '0')
  })

  it('takes its name from a heading', () => {
    render(
      <>
        <h2 id="standings">Standings</h2>
        <ScrollRegion labelledBy="standings">
          <table />
        </ScrollRegion>
      </>,
    )

    expect(screen.getByRole('region', { name: 'Standings' })).toBeInTheDocument()
  })
})
