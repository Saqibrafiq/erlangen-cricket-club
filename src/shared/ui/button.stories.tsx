import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from './button'

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: { children: 'Join the club' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = { args: { variant: 'secondary' } }

export const Ghost: Story = { args: { variant: 'ghost' } }

/** For photos and dark bands; shown on the media overlay colour. */
export const OnMedia: Story = {
  args: { variant: 'on-media' },
  decorators: [
    (Story) => (
      <div className="bg-media-overlay p-6">
        <Story />
      </div>
    ),
  ],
}

export const OnMediaOutline: Story = {
  args: { variant: 'on-media-outline' },
  decorators: OnMedia.decorators,
}

export const Small: Story = { args: { size: 'sm' } }

export const Large: Story = { args: { size: 'lg' } }

export const Disabled: Story = { args: { disabled: true } }

export const AsLink: Story = {
  args: { asChild: true, children: <a href="#membership">Become a member</a> },
}
