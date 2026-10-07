import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { NavLink } from './nav-link'

const pathname = vi.hoisted(() => ({ current: '/' }))

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => pathname.current,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

describe('NavLink', () => {
  beforeEach(() => {
    pathname.current = '/'
  })

  it('marks the link for the current page with aria-current', () => {
    pathname.current = '/fixtures'
    renderWithIntl(<NavLink href="/fixtures">Fixtures & Results</NavLink>)

    expect(screen.getByRole('link', { name: 'Fixtures & Results' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('marks a section link as current on the pages below it', () => {
    pathname.current = '/news/annual-general-meeting-2024-key-takeaways'
    renderWithIntl(
      <NavLink href="/news" section>
        News
      </NavLink>,
    )

    expect(screen.getByRole('link', { name: 'News' })).toHaveAttribute('aria-current', 'true')
  })

  it('does not treat home as the section of every page', () => {
    pathname.current = '/news'
    renderWithIntl(
      <NavLink href="/" section>
        Home
      </NavLink>,
    )

    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('marks only the exact page without section', () => {
    pathname.current = '/news/annual-general-meeting-2024-key-takeaways'
    renderWithIntl(<NavLink href="/news">News</NavLink>)

    expect(screen.getByRole('link', { name: 'News' })).not.toHaveAttribute('aria-current')
  })

  it('does not mark links to other pages', () => {
    renderWithIntl(<NavLink href="/fixtures">Fixtures & Results</NavLink>)

    expect(screen.getByRole('link', { name: 'Fixtures & Results' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
