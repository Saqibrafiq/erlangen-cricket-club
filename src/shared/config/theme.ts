/** What a visitor can pick: follow the device, or one of the three themes. */
export const THEME_CHOICES = ['auto', 'light', 'dark', 'ecc'] as const
export type ThemeChoice = (typeof THEME_CHOICES)[number]

/** What the page actually shows; "auto" resolves to light or dark. */
export type Theme = Exclude<ThemeChoice, 'auto'>

/** Browser storage key of the choice (a preference, not tracking: never leaves the browser). */
export const THEME_STORAGE_KEY = 'ecc-theme'
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)'

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return THEME_CHOICES.some((choice) => choice === value)
}

/** The theme to show for a choice, given whether the device prefers dark. */
export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): Theme {
  if (choice !== 'auto') {
    return choice
  }
  return prefersDark ? 'dark' : 'light'
}

/**
 * Runs in <head> before the first paint, so the page never flashes the wrong theme. Kept tiny
 * and self-contained (no imports at runtime): it is inlined as a string.
 */
export const THEME_SCRIPT = `(function(){try{var c=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var t=c==='light'||c==='dark'||c==='ecc'?c:(matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`
