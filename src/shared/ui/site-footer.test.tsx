import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { SiteFooter } from './site-footer'

const LINKS = [
  { href: '/impressum', label: 'Legal notice' },
  { href: '/datenschutz', label: 'Privacy policy' },
]

describe('SiteFooter', () => {
  it('links to the legal pages', () => {
    renderWithIntl(<SiteFooter legalLinks={LINKS} year={2026} />)

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

  it('shows the copyright year and club name', () => {
    renderWithIntl(<SiteFooter legalLinks={LINKS} year={2026} />)

    expect(screen.getByText('© 2026 Erlangen Cricket Club')).toBeInTheDocument()
  })
})
