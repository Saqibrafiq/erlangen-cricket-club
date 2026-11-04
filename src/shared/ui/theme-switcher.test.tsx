import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { THEME_STORAGE_KEY } from '@/shared/config/theme'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { ThemeSwitcher } from './theme-switcher'

// The test setup provides IntersectionObserver as a global stub; keep it when unstubbing.
const { IntersectionObserver } = globalThis

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
})

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  vi.unstubAllGlobals()
  vi.stubGlobal('IntersectionObserver', IntersectionObserver)
})

describe('ThemeSwitcher', () => {
  it('offers Auto, Light, Dark and ECC, with the current choice checked', async () => {
    renderWithIntl(<ThemeSwitcher />)

    await userEvent.click(screen.getByRole('button', { name: 'Theme: Auto' }))

    const menu = await screen.findByRole('menu')
    expect(
      within(menu)
        .getAllByRole('menuitemradio')
        .map((item) => item.textContent),
    ).toEqual(['Auto', 'Light', 'Dark', 'ECC'])
    expect(within(menu).getByRole('menuitemradio', { name: 'Auto' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('applies and remembers the chosen theme', async () => {
    renderWithIntl(<ThemeSwitcher />)

    await userEvent.click(screen.getByRole('button', { name: 'Theme: Auto' }))
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'ECC' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'ecc')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('ecc')
    expect(await screen.findByRole('button', { name: 'Theme: ECC' })).toBeInTheDocument()
  })

  it('resolves Auto from the device setting', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'ecc')
    renderWithIntl(<ThemeSwitcher />)

    await userEvent.click(screen.getByRole('button', { name: 'Theme: ECC' }))
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'Auto' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('auto')
  })
})
