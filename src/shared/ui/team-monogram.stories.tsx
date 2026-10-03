import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TeamMonogram } from './team-monogram'

const meta = {
  title: 'Shared/TeamMonogram',
  component: TeamMonogram,
  args: { shortName: 'NCC-I' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['club', 'opponent'] },
    size: { control: 'inline-radio', options: ['sm', 'lg'] },
  },
} satisfies Meta<typeof TeamMonogram>

export default meta

type Story = StoryObj<typeof meta>

export const Opponent: Story = {}

export const Club: Story = { args: { shortName: 'ECC-I', tone: 'club' } }

export const Large: Story = { args: { shortName: 'ECC-II', tone: 'club', size: 'lg' } }
