import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Flag } from './flag'

const meta = {
  title: 'Shared/Flag',
  component: Flag,
  args: { country: 'gb' },
} satisfies Meta<typeof Flag>

export default meta

type Story = StoryObj<typeof meta>

export const UnitedKingdom: Story = {}

export const Germany: Story = { args: { country: 'de' } }

export const Large: Story = { args: { className: 'h-12 w-18' } }
