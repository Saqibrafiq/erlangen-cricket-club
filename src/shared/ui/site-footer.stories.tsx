import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SiteFooter } from './site-footer'

const meta = {
  title: 'Shared/SiteFooter',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
  args: {
    year: 2026,
    legalLinks: [
      { href: '/impressum', label: 'Legal notice' },
      { href: '/datenschutz', label: 'Privacy policy' },
    ],
  },
} satisfies Meta<typeof SiteFooter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
