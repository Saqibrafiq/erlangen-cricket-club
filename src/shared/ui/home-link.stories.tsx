import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HomeLink } from './home-link'

const meta = {
  title: 'Shared/HomeLink',
  component: HomeLink,
  args: {
    children: 'Erlangen Cricket Club',
    className: 'font-display text-xl font-bold uppercase underline-offset-4 hover:underline',
  },
} satisfies Meta<typeof HomeLink>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** On the home page itself, it scrolls back to the top instead. */
export const OnHomePage: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
}
