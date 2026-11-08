import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HeaderShell } from './header-shell'

const meta = {
  title: 'Shared/HeaderShell',
  component: HeaderShell,
  args: {
    children: (
      <div className="flex min-h-14 items-center px-4 font-display font-bold uppercase">
        Erlangen Cricket Club
      </div>
    ),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <p className="px-4 pt-32 text-text-muted">
          Scroll down: the wide pill becomes a floating one.
        </p>
        {/* Room to scroll past the first screen. */}
        <div className="h-screen" />
      </div>
    ),
  ],
} satisfies Meta<typeof HeaderShell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
