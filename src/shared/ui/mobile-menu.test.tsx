import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { MobileMenu } from './mobile-menu'
import type { SiteNavigationItem } from './nav-menu'

const pathname = vi.hoisted(() => ({ current: '/' }))

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => pathname.current,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

const ITEMS: SiteNavigationItem[] = [
  { href: '/', label: 'Home' },
  {
    href: '/standings',
    label: 'Standings',
    groups: [
      { links: [{ href: '/standings', label: 'All standings' }] },
      {
        label: 'Erlangen Cricket Club I',
        links: [{ href: '/standings/bcv-t20', label: 'BCV T20 Regionalliga' }],
      },
    ],
  },
  { href: '/news', label: 'News' },
]

async function openMenu() {
  const user = userEvent.setup()
  renderWithIntl(<MobileMenu items={ITEMS} />)
  await user.click(screen.getByRole('button', { name: 'Menu' }))
  return { user, dialog: screen.getByRole('dialog', { name: 'Menu' }) }
}

describe('MobileMenu', () => {
  beforeEach(() => {
    pathname.current = '/'
  })

  it('opens a dialog with the main navigation', async () => {
    const { dialog } = await openMenu()

    const nav = within(dialog).getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'News' })).toHaveAttribute('href', '/news')
  })

  it('lists a section’s pages grouped by team', async () => {
    const { user, dialog } = await openMenu()

    await user.click(within(dialog).getByText('Standings'))

    const team = within(dialog).getByRole('list', { name: 'Erlangen Cricket Club I' })
    expect(within(team).getByRole('link', { name: 'BCV T20 Regionalliga' })).toHaveAttribute(
      'href',
      '/standings/bcv-t20',
    )
  })

  it('opens the current section by itself', async () => {
    pathname.current = '/standings/bcv-t20'
    const { dialog } = await openMenu()

    expect(within(dialog).getByRole('link', { name: 'BCV T20 Regionalliga' })).toBeVisible()
    expect(within(dialog).getByRole('link', { name: 'BCV T20 Regionalliga' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('marks a top-level link as current on the pages below it', async () => {
    pathname.current = '/news/annual-general-meeting-2024'
    const { dialog } = await openMenu()

    expect(within(dialog).getByRole('link', { name: 'News' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('closes when a page is chosen', async () => {
    const { user, dialog } = await openMenu()

    await user.click(within(dialog).getByRole('link', { name: 'News' }))

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes with Escape and the close button, returning focus to the menu button', async () => {
    const { user } = await openMenu()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    await user.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
