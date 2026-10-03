import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Breadcrumbs } from './breadcrumbs'

const meta = {
  title: 'Shared/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    items: [
      { label: 'Fixtures & Results', href: '/fixtures' },
      { label: 'DCB-Bundesliga Südost: Bayern 2026' },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>

export default meta

type Story = StoryObj<typeof meta>

export const TwoLevels: Story = {}

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Fixtures & Results', href: '/fixtures' },
      { label: 'BCV T20 Regionalliga Bayern 2026' },
    ],
  },
}
