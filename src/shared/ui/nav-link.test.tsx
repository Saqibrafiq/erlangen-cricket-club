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

  it('does not mark links to other pages', () => {
    renderWithIntl(<NavLink href="/fixtures">Fixtures & Results</NavLink>)

    expect(screen.getByRole('link', { name: 'Fixtures & Results' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
