import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { SeasonSwitcher } from './season-switcher'

const hrefFor = (season: string) =>
  season === '2027' ? '/standings' : `/standings/season/${season}`

describe('SeasonSwitcher', () => {
  it('links every season and marks the one shown', () => {
    renderWithIntl(
      <SeasonSwitcher
        label="Seasons"
        seasons={['2027', '2026']}
        current="2026"
        hrefFor={hrefFor}
      />,
    )

    const nav = screen.getByRole('navigation', { name: 'Seasons' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '2027' })).toHaveAttribute('href', '/standings')
    expect(screen.getByRole('link', { name: '2026' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '2027' })).not.toHaveAttribute('aria-current')
  })

  it('is not shown while there is only one season', () => {
    renderWithIntl(
      <SeasonSwitcher label="Seasons" seasons={['2027']} current="2027" hrefFor={hrefFor} />,
    )

    expect(screen.queryByRole('navigation')).toBeNull()
  })
})
