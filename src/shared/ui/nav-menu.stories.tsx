import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { NavMenu } from './nav-menu'

const meta = {
  title: 'Shared/NavMenu',
  component: NavMenu,
  args: {
    label: 'Fixtures & Results',
    href: '/fixtures',
    groups: [
      { links: [{ href: '/fixtures', label: 'All fixtures & results' }] },
      {
        label: 'Erlangen Cricket Club I',
        links: [
          { href: '/fixtures/t20', label: 'BCV T20 Regionalliga Bayern 2026' },
          { href: '/fixtures/odi', label: 'BCV Regionalliga Bayern 2026' },
        ],
      },
    ],
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof NavMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Fixtures & Results' }))
    await expect(canvas.getByRole('link', { name: 'All fixtures & results' })).toBeVisible()
  },
}

/** Marked as current on its section's pages. */
export const CurrentSection: Story = {
  parameters: { nextjs: { navigation: { pathname: '/fixtures/t20' } } },
}
