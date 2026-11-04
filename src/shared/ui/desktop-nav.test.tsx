import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { DesktopNav } from './desktop-nav'

const pathname = vi.hoisted(() => ({ current: '/' }))
vi.mock('@/i18n/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => pathname.current,
}))

const ITEMS = [
  { href: '/', label: 'Home' },
  {
    href: '/fixtures',
    label: 'Fixtures & Results',
    groups: [{ links: [{ href: '/fixtures', label: 'All fixtures & results' }] }],
  },
  { href: '/news', label: 'News' },
]

describe('DesktopNav', () => {
  beforeEach(() => {
    pathname.current = '/'
  })

  it('keeps the current page marked for assistive technology', () => {
    pathname.current = '/news/agm-2026'
    renderWithIntl(<DesktopNav label="Main" items={ITEMS} />)

    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'News' })).toHaveAttribute('aria-current', 'true')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('marks the current section with a bar under it (decoration, hidden from screen readers)', () => {
    pathname.current = '/news'
    const { container } = renderWithIntl(<DesktopNav label="Main" items={ITEMS} />)

    const bars = container.querySelectorAll('span[aria-hidden="true"].bg-brand-primary')
    expect(bars).toHaveLength(1)
    expect(bars[0]?.closest('li')).toHaveTextContent('News')
  })

  it('shows the highlight while the pointer or keyboard focus is on an item', async () => {
    const { container } = renderWithIntl(<DesktopNav label="Main" items={ITEMS} />)
    const highlight = container.querySelector('span[aria-hidden="true"].bg-surface-muted')

    expect(highlight).toHaveAttribute('data-visible', 'false')
    await userEvent.hover(screen.getByRole('link', { name: 'News' }))
    expect(highlight).toHaveAttribute('data-visible', 'true')

    await userEvent.unhover(screen.getByRole('link', { name: 'News' }))
    expect(highlight).toHaveAttribute('data-visible', 'false')

    await userEvent.tab()
    expect(highlight).toHaveAttribute('data-visible', 'true')
  })
})
