import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { SiteHeader } from './site-header'

const meta = {
  title: 'Shared/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
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
            links: [
              {
                href: '/fixtures/bcv-t20-regionalliga-bayern-2026',
                label: 'BCV T20 Regionalliga Bayern 2026',
              },
              {
                href: '/fixtures/dcb-bundesliga-suedost-bayern-2026',
                label: 'DCB-Bundesliga Südost: Bayern 2026',
              },
            ],
          },
          {
            label: 'Erlangen Cricket Club II',
            links: [
              {
                href: '/fixtures/bcv-regionalliga-bayern-2026',
                label: 'BCV Regionalliga Bayern 2026',
              },
            ],
          },
        ],
      },
    ],
  },
} satisfies Meta<typeof SiteHeader>

export default meta

type Story = StoryObj<typeof meta>

export const OnHomePage: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
}

export const FixturesMenuOpen: Story = {
  parameters: { nextjs: { navigation: { pathname: '/fixtures' } } },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Fixtures & Results' })
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-expanded', 'true')
  },
}
