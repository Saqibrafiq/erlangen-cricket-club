import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Skeleton } from './skeleton'

const meta = {
  title: 'Shared/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Line: Story = { args: { className: 'h-4 w-48' } }

export const Card: Story = { args: { className: 'h-32 w-full max-w-md' } }
