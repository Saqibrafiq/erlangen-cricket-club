import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { StandingsLegend } from './standings-legend'

describe('StandingsLegend', () => {
  it('explains every abbreviated column', () => {
    renderWithIntl(<StandingsLegend />)

    expect(screen.getByText('NRR').nextElementSibling).toHaveTextContent('Net run rate')
    expect(screen.queryByText('Position')).toBeNull()
  })
})
