import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { ThemeSwitcher } from './theme-switcher'

const meta = {
  title: 'Shared/ThemeSwitcher',
  component: ThemeSwitcher,
  decorators: [
    (Story) => (
      <div className="flex min-h-72 justify-end p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeSwitcher>

export default meta

type Story = StoryObj<typeof meta>

/** The header icon; it shows the current choice. */
export const Closed: Story = {}

/** The four choices with their colour swatches. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /^Theme:/ }))
    await expect(await within(document.body).findByRole('menu')).toBeVisible()
  },
}
