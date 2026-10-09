import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { PillGroup, type PillGroupProps } from './pill-group'

type Status = 'all' | 'completed' | 'walkover' | 'forfeit'

function Controlled(props: Omit<PillGroupProps<Status>, 'value' | 'onChange'>) {
  const [value, setValue] = useState<Status>('all')
  return <PillGroup {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Shared/PillGroup',
  component: Controlled,
  args: {
    legend: 'Status',
    options: [
      { value: 'all', label: 'All', count: 49 },
      { value: 'completed', label: 'Completed', count: 42 },
      { value: 'walkover', label: 'Walkover', count: 2 },
      { value: 'forfeit', label: 'Forfeit', count: 5 },
    ],
  },
} satisfies Meta<typeof Controlled>

export default meta

type Story = StoryObj<typeof meta>

export const Wrapping: Story = {}

/** Vertical in a sidebar from lg, e.g. the fixtures filters. */
export const Sidebar: Story = { args: { layout: 'sidebar' } }

export const HiddenLegend: Story = { args: { isLegendHidden: true } }

export const WithoutCounts: Story = {
  args: {
    options: [
      { value: 'all', label: 'All' },
      { value: 'completed', label: 'Completed' },
    ],
  },
}
