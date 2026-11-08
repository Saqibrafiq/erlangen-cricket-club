import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { buttonVariants } from './button'
import { PressableButton } from './pressable-button'

/** The bare press feedback; Button adds the site's look on top (as here). */
const meta = {
  title: 'Shared/PressableButton',
  component: PressableButton,
  args: {
    type: 'button',
    children: 'Press me',
    onClick: fn(),
    className: buttonVariants(),
  },
} satisfies Meta<typeof PressableButton>

export default meta

type Story = StoryObj<typeof meta>

/** Press and hold: it gives way a little on the site's spring. */
export const Default: Story = {}

export const Disabled: Story = { args: { disabled: true } }
