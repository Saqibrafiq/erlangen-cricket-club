import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CountUp } from './count-up'
import { Reveal } from './reveal'

const meta = {
  title: 'Shared/Reveal',
  component: Reveal,
  args: {
    children: (
      <div className="rounded-3xl border border-border-default p-8">
        <p className="font-display text-6xl font-bold">
          <CountUp value={49} />
        </p>
        <p className="text-text-muted">matches played</p>
      </div>
    ),
  },
} satisfies Meta<typeof Reveal>

export default meta

type Story = StoryObj<typeof meta>

/** Fades and slides in on entering the viewport; the number counts up. */
export const Default: Story = {}

export const Delayed: Story = { args: { delay: 0.4 } }
