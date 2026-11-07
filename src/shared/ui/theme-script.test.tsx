import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { THEME_STORAGE_KEY } from '@/shared/config/theme'

import { ThemeScript } from './theme-script'

describe('ThemeScript', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    vi.unstubAllGlobals()
  })

  it('creates no script in the browser and applies the stored theme instead', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    localStorage.setItem(THEME_STORAGE_KEY, 'ecc')

    const { container } = render(<ThemeScript />)

    expect(container.querySelector('script')).toBeNull()
    expect(document.documentElement).toHaveAttribute('data-theme', 'ecc')
  })

  it('follows the device setting for "auto" (no stored choice)', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))

    render(<ThemeScript />)

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })
})
