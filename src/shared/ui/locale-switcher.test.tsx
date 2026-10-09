import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { LocaleSwitcher } from './locale-switcher'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => '/fixtures',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

async function openMenu(locale: 'en' | 'de' = 'en') {
  const user = userEvent.setup()
  renderWithIntl(<LocaleSwitcher />, { locale })
  await user.click(screen.getByRole('button', { name: /Language|Sprache/ }))
  return within(screen.getByRole('menu'))
}

describe('LocaleSwitcher', () => {
  it('names the current language on its button', () => {
    renderWithIntl(<LocaleSwitcher />, { locale: 'de' })

    expect(screen.getByRole('button', { name: /Deutsch/ })).toHaveTextContent('de')
  })

  it('links to the current page in every language, named in that language', async () => {
    const menu = await openMenu()

    // The explicit locale prefix lets the proxy store the chosen language in its cookie.
    expect(menu.getByRole('menuitem', { name: 'English' })).toHaveAttribute('href', '/en/fixtures')
    expect(menu.getByRole('menuitem', { name: 'Deutsch' })).toHaveAttribute('href', '/de/fixtures')
    expect(menu.getByRole('menuitem', { name: 'Deutsch' })).toHaveAttribute('lang', 'de')
  })

  it('marks the current language', async () => {
    const menu = await openMenu('de')

    expect(menu.getByRole('menuitem', { name: 'Deutsch' })).toHaveAttribute('aria-current', 'true')
    expect(menu.getByRole('menuitem', { name: 'English' })).not.toHaveAttribute('aria-current')
  })
})
