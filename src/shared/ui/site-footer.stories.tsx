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

/** As on the site: link columns, where to find us, socials and the credit. */
export const Full: Story = {
  args: {
    columns: [
      {
        label: 'Club',
        links: [
          { href: '/players', label: 'Players' },
          { href: '/news', label: 'News' },
          { href: '/journey', label: 'Journey' },
          { href: '/sponsors', label: 'Sponsors' },
        ],
      },
      {
        label: 'Matches',
        links: [
          { href: '/fixtures', label: 'Fixtures & Results' },
          { href: '/standings', label: 'Standings' },
        ],
      },
      {
        label: 'Join',
        links: [
          { href: '/membership', label: 'Membership' },
          { href: '/contact', label: 'Contact' },
        ],
      },
    ],
    visit: {
      training: 'Thursday 17:30–20:00',
      ground: {
        name: 'Erlangen Cricket Ground',
        address: 'Siedlerstraße 1, 91058 Erlangen',
        href: '/contact#ground',
      },
      email: 'erlangencricketclub@gmail.com',
    },
    socialLinks: [
      { network: 'instagram', href: 'https://www.instagram.com/er_cricketclub' },
      { network: 'facebook', href: 'https://www.facebook.com/CricketClubErlangen' },
    ],
  },
}

/** The minimum: legal links and the copyright lines. */
export const Minimal: Story = {}
