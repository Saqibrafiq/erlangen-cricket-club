import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { NavLink } from './nav-link'

const meta = {
  title: 'Shared/NavLink',
  component: NavLink,
  args: { href: '/news', children: 'News' },
  parameters: { nextjs: { navigation: { pathname: '/fixtures' } } },
} satisfies Meta<typeof NavLink>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** On its own page: underlined and `aria-current="page"`. */
export const CurrentPage: Story = {
  parameters: { nextjs: { navigation: { pathname: '/news' } } },
}

/** With `section`, it is also marked on the pages below it. */
export const CurrentSection: Story = {
  args: { section: true },
  parameters: { nextjs: { navigation: { pathname: '/news/2026-season-review' } } },
}
