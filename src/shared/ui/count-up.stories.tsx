import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CountUp } from './count-up'

const meta = {
  title: 'Shared/CountUp',
  component: CountUp,
  args: { value: 1250, className: 'font-display text-5xl font-bold tabular-nums' },
} satisfies Meta<typeof CountUp>

export default meta

type Story = StoryObj<typeof meta>

/** Counts up from zero when it scrolls into view; screen readers get the final value. */
export const Integer: Story = {}

export const Percentage: Story = {
  args: { value: 0.625, format: (value) => `${(value * 100).toFixed(1)} %` },
}

export const ScoreboardDigits: Story = {
  args: {
    value: 187,
    render: (text) => (
      <span className="rounded-md bg-scoreboard px-3 py-1 text-text-on-scoreboard">{text}</span>
    ),
  },
}
