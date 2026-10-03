import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { LocaleSwitcher } from './locale-switcher'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => '/fixtures',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

describe('LocaleSwitcher', () => {
  it('links to the current page in every language, named in that language', () => {
    renderWithIntl(<LocaleSwitcher />)

    const nav = screen.getByRole('navigation', { name: 'Language' })
    // The explicit locale prefix lets the proxy store the chosen language in its cookie.
    expect(within(nav).getByRole('link', { name: /English/ })).toHaveAttribute(
      'href',
      '/en/fixtures',
    )
    expect(within(nav).getByRole('link', { name: /Deutsch/ })).toHaveAttribute(
      'href',
      '/de/fixtures',
    )
    expect(within(nav).getByRole('link', { name: /Deutsch/ })).toHaveAttribute('lang', 'de')
  })

  it('marks the current language', () => {
    renderWithIntl(<LocaleSwitcher />, { locale: 'de' })

    expect(screen.getByRole('link', { name: /Deutsch/ })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: /English/ })).not.toHaveAttribute('aria-current')
  })
})
