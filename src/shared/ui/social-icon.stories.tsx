import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SocialIcon } from './social-icon'

const meta = {
  title: 'Shared/SocialIcon',
  component: SocialIcon,
  args: { network: 'instagram' },
} satisfies Meta<typeof SocialIcon>

export default meta

type Story = StoryObj<typeof meta>

export const Instagram: Story = {}

export const Facebook: Story = { args: { network: 'facebook' } }

export const Large: Story = { args: { className: 'size-10 text-brand-primary' } }
