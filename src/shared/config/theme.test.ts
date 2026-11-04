import { afterEach, describe, expect, it, vi } from 'vitest'

import { isThemeChoice, resolveTheme, THEME_SCRIPT, THEME_STORAGE_KEY } from './theme'

function runThemeScript() {
  // The script is inlined in <head>; here it runs as the browser would run it.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the inlined script under test
  const run = new Function(THEME_SCRIPT) as () => void
  run()
  return document.documentElement.getAttribute('data-theme')
}

function prefersDark(isDark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: isDark, media: query }))
}

afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('resolveTheme', () => {
  it('keeps a chosen theme and resolves auto from the device', () => {
    expect(resolveTheme('ecc', true)).toBe('ecc')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('auto', true)).toBe('dark')
    expect(resolveTheme('auto', false)).toBe('light')
  })
})

describe('isThemeChoice', () => {
  it('accepts the four choices only', () => {
    expect(['auto', 'light', 'dark', 'ecc'].every(isThemeChoice)).toBe(true)
    expect(isThemeChoice('blue')).toBe(false)
    expect(isThemeChoice(null)).toBe(false)
  })
})

describe('THEME_SCRIPT', () => {
  it('applies the stored theme before the page paints', () => {
    prefersDark(true)
    localStorage.setItem(THEME_STORAGE_KEY, 'ecc')

    expect(runThemeScript()).toBe('ecc')
  })

  it('follows the device without a (valid) choice', () => {
    prefersDark(true)
    expect(runThemeScript()).toBe('dark')

    prefersDark(false)
    localStorage.setItem(THEME_STORAGE_KEY, 'neon')
    expect(runThemeScript()).toBe('light')
  })
})
