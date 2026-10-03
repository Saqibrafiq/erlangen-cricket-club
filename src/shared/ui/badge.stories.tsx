import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Badge } from './badge'

const meta = {
  title: 'Shared/Badge',
  component: Badge,
  args: { children: 'Final' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['neutral', 'brand', 'success', 'danger'] },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Neutral: Story = { args: { children: 'Tied' } }

export const Brand: Story = { args: { variant: 'brand', children: 'Final' } }

export const Success: Story = { args: { variant: 'success', children: 'Won' } }

export const Danger: Story = { args: { variant: 'danger', children: 'Lost' } }
