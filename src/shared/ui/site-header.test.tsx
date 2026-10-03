import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { SiteHeader, type SiteNavigationItem } from './site-header'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

const ITEMS: SiteNavigationItem[] = [
  { href: '/', label: 'Home' },
  {
    href: '/fixtures',
    label: 'Fixtures & Results',
    groups: [{ links: [{ href: '/fixtures', label: 'All fixtures & results' }] }],
  },
]

describe('SiteHeader', () => {
  it('links the club name to the home page', () => {
    renderWithIntl(<SiteHeader items={ITEMS} />)

    expect(screen.getByRole('link', { name: 'Erlangen Cricket Club' })).toHaveAttribute('href', '/')
  })

  it('renders plain items as links and items with groups as dropdown buttons', () => {
    renderWithIntl(<SiteHeader items={ITEMS} />)

    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('button', { name: 'Fixtures & Results' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('uses German labels for the German locale', () => {
    renderWithIntl(<SiteHeader items={ITEMS} />, { locale: 'de' })

    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument()
  })
})
