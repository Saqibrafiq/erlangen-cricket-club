import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Container } from './container'

const meta = {
  title: 'Shared/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: {
    children: (
      <div className="rounded-md bg-surface-muted p-4 text-sm">
        Content stays within the container&apos;s bounds and gutters.
      </div>
    ),
  },
  argTypes: {
    width: { control: 'inline-radio', options: ['wide', 'prose'] },
  },
} satisfies Meta<typeof Container>

export default meta

type Story = StoryObj<typeof meta>

export const Wide: Story = {}

export const Prose: Story = { args: { width: 'prose' } }
