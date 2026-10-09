import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { PillGroup, type PillOption } from './pill-group'

type Role = 'all' | 'batter' | 'bowler'

const OPTIONS: PillOption<Role>[] = [
  { value: 'all', label: 'All', count: 3 },
  { value: 'batter', label: 'Batters', count: 2 },
  { value: 'bowler', label: 'Bowlers' },
]

function Controlled({ isLegendHidden = false }: { isLegendHidden?: boolean }) {
  const [value, setValue] = useState<Role>('all')
  return (
    <PillGroup
      legend="Role"
      isLegendHidden={isLegendHidden}
      options={OPTIONS}
      value={value}
      onChange={setValue}
    />
  )
}

describe('PillGroup', () => {
  it('is a group of radios named by its legend, with counts in the labels', () => {
    render(<Controlled />)

    expect(screen.getByRole('group', { name: 'Role' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'All (3)' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Batters (2)' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Bowlers' })).toBeInTheDocument()
  })

  it('selects the option whose pill is clicked', async () => {
    const user = userEvent.setup()
    render(<Controlled />)

    await user.click(screen.getByText('Bowlers'))

    expect(screen.getByRole('radio', { name: 'Bowlers' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'All (3)' })).not.toBeChecked()
  })

  it('moves between options with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<Controlled />)

    await user.click(screen.getByRole('radio', { name: 'All (3)' }))
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('radio', { name: 'Batters (2)' })).toBeChecked()
  })

  it('can hide the legend visually while keeping the group name', () => {
    render(<Controlled isLegendHidden />)

    expect(screen.getByText('Role')).toHaveClass('sr-only')
    expect(screen.getByRole('group', { name: 'Role' })).toBeInTheDocument()
  })
})
