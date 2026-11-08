import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DesktopNav } from './desktop-nav'

const meta = {
  title: 'Shared/DesktopNav',
  component: DesktopNav,
  args: {
    label: 'Main',
    items: [
      { href: '/', label: 'Home' },
      {
        href: '/fixtures',
        label: 'Fixtures & Results',
        groups: [{ links: [{ href: '/fixtures', label: 'All fixtures & results' }] }],
      },
      { href: '/players', label: 'Players' },
      { href: '/news', label: 'News' },
      { href: '/membership', label: 'Membership' },
    ],
  },
  parameters: { nextjs: { navigation: { pathname: '/news' } } },
} satisfies Meta<typeof DesktopNav>

export default meta

type Story = StoryObj<typeof meta>

/**
 * Shown from 1280 px (`xl`), so widen the canvas. Hover along the row: the highlight slides from
 * item to item; the bar marks the current page.
 */
export const Default: Story = {}

export const OnHomePage: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
}
