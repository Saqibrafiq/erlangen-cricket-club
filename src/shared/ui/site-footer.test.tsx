import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { SiteFooter, type SiteFooterProps } from './site-footer'

const PROPS: SiteFooterProps = {
  year: 2026,
  legalLinks: [
    { href: '/impressum', label: 'Legal notice' },
    { href: '/datenschutz', label: 'Privacy policy' },
  ],
  columns: [
    {
      label: 'Club',
      links: [
        { href: '/players', label: 'Players' },
        { href: '/sponsors', label: 'Sponsors' },
      ],
    },
    { label: 'Join', links: [{ href: '/membership', label: 'Membership' }] },
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
  socialLinks: [{ network: 'instagram', href: 'https://www.instagram.com/er_cricketclub' }],
}

describe('SiteFooter', () => {
  it('links to the legal pages', () => {
    renderWithIntl(<SiteFooter {...PROPS} />)

    const nav = screen.getByRole('navigation', { name: 'Legal' })
    expect(within(nav).getByRole('link', { name: 'Legal notice' })).toHaveAttribute(
      'href',
      '/impressum',
    )
    expect(within(nav).getByRole('link', { name: 'Privacy policy' })).toHaveAttribute(
      'href',
      '/datenschutz',
    )
  })

  it('shows each link column as a named navigation', () => {
    renderWithIntl(<SiteFooter {...PROPS} />)

    const club = screen.getByRole('navigation', { name: 'Club' })
    expect(within(club).getByRole('link', { name: 'Sponsors' })).toHaveAttribute(
      'href',
      '/sponsors',
    )
    expect(screen.getByRole('navigation', { name: 'Join' })).toBeInTheDocument()
  })

  it('tells visitors when and where to find the club', () => {
    renderWithIntl(<SiteFooter {...PROPS} />)

    const visit = within(screen.getByRole('region', { name: 'Visit us' }))
    expect(visit.getByText('Thursday 17:30–20:00')).toBeInTheDocument()
    expect(visit.getByRole('link', { name: /Erlangen Cricket Ground/ })).toHaveAttribute(
      'href',
      '/contact#ground',
    )
    expect(visit.getByRole('link', { name: 'erlangencricketclub@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:erlangencricketclub@gmail.com',
    )
  })

  it('separates the club’s copyright from the website’s, crediting its author by name', () => {
    renderWithIntl(<SiteFooter {...PROPS} />)

    expect(screen.getByText('© 2026 Erlangen Cricket Club')).toBeInTheDocument()
    expect(
      screen.getByText(/Club name, crest, photos and texts belong to the club/),
    ).toBeInTheDocument()
    expect(screen.getByText('Website designed and built by Saqib Rafiq')).toBeInTheDocument()
    // The name only, without a link to a profile.
    expect(screen.queryByRole('link', { name: 'Saqib Rafiq' })).toBeNull()
    expect(
      screen.getByText('Website design and code © 2026 Saqib Rafiq. All rights reserved.'),
    ).toBeInTheDocument()
  })

  it('links to social media in a new tab', () => {
    renderWithIntl(<SiteFooter {...PROPS} />)

    const social = within(screen.getByRole('list', { name: 'Social media' }))
    expect(
      social.getByRole('link', { name: 'Erlangen Cricket Club on Instagram (opens in a new tab)' }),
    ).toHaveAttribute('target', '_blank')
  })

  it('leaves out columns, visit details and socials that are not given', () => {
    renderWithIntl(<SiteFooter year={2026} legalLinks={PROPS.legalLinks} />)

    expect(screen.queryByRole('navigation', { name: 'Club' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Visit us' })).toBeNull()
    expect(screen.queryByRole('list', { name: 'Social media' })).toBeNull()
  })
})
