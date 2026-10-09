import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { LocaleSwitcher } from './locale-switcher'

const meta = {
  title: 'Shared/LocaleSwitcher',
  component: LocaleSwitcher,
  parameters: { nextjs: { navigation: { pathname: '/fixtures' } } },
} satisfies Meta<typeof LocaleSwitcher>

export default meta

type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    await expect(within(document.body).getByRole('menu')).toBeVisible()
  },
}
