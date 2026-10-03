import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { SkipLink } from './skip-link'

const meta = {
  title: 'Shared/SkipLink',
  component: SkipLink,
  args: { children: 'Skip to main content' },
} satisfies Meta<typeof SkipLink>

export default meta

type Story = StoryObj<typeof meta>

/** Hidden until it receives keyboard focus. */
export const Hidden: Story = {}

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(within(canvasElement).getByRole('link')).toHaveFocus()
  },
}
