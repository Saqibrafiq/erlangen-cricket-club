import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { AnimatedList, AnimatedListItem } from './animated-list'
import { PillGroup } from './pill-group'

const TEAMS = [
  { name: 'Erlangen Cricket Club I', format: 't20' },
  { name: 'Erlangen Cricket Club II', format: 'odi' },
  { name: 'Nürnberg Cricket Club', format: 't20' },
  { name: 'Munich Cricket Club', format: 'odi' },
  { name: 'Regensburg Cricket Club', format: 't20' },
] as const

type Filter = 'all' | 't20' | 'odi'

function FilteredTeams() {
  const [filter, setFilter] = useState<Filter>('all')
  const shown = TEAMS.filter((team) => filter === 'all' || team.format === filter)
  return (
    <div className="space-y-4">
      <PillGroup
        legend="Format"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All' },
          { value: 't20', label: 'T20' },
          { value: 'odi', label: '50 overs' },
        ]}
      />
      <AnimatedList aria-label="Teams" className="grid max-w-md gap-2">
        {shown.map((team) => (
          <AnimatedListItem
            key={team.name}
            className="rounded-xl border border-border-default bg-surface-default p-3"
          >
            {team.name}
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </div>
  )
}

const meta = {
  title: 'Shared/AnimatedList',
  component: FilteredTeams,
} satisfies Meta<typeof FilteredTeams>

export default meta

type Story = StoryObj<typeof meta>

/** Change the filter: staying items glide, new ones grow in, removed ones shrink away. */
export const Filtering: Story = {}
