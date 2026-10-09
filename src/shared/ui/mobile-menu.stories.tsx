import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { MobileMenu } from './mobile-menu'

const meta = {
  title: 'Shared/MobileMenu',
  component: MobileMenu,
  args: {
    items: [
      { href: '/', label: 'Home' },
      {
        href: '/fixtures',
        label: 'Fixtures & Results',
        groups: [
          { links: [{ href: '/fixtures', label: 'All fixtures & results' }] },
          {
            label: 'Erlangen Cricket Club I',
            links: [{ href: '/fixtures/t20', label: 'BCV T20 Regionalliga Bayern 2026' }],
          },
        ],
      },
      { href: '/news', label: 'News' },
      { href: '/membership', label: 'Membership' },
    ],
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
} satisfies Meta<typeof MobileMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Menu' }))
    // The panel renders in a portal, outside the story's canvas.
    await expect(within(document.body).getByRole('dialog', { name: 'Menu' })).toBeVisible()
  },
}
