'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

import {
  DARK_SCHEME_QUERY,
  isThemeChoice,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemeChoice,
} from '@/shared/config/theme'

/** Where a switch starts, e.g. the centre of the theme button, in viewport pixels. */
export type ThemeSwitchOrigin = { x: number; y: number }

/** The circular reveal of the new theme. */
const REVEAL_MS = 600
const REVEAL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
/** Without View Transitions, colours blend instead (see globals.css). */
const BLEND_MS = 250
const BLEND_CLASS = 'theme-transition'
const CHANGE_EVENT = 'ecc:theme'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeChoice(stored) ? stored : 'auto'
  } catch {
    return 'auto'
  }
}

function applyTheme(choice: ThemeChoice) {
  const theme = resolveTheme(choice, window.matchMedia(DARK_SCHEME_QUERY).matches)
  document.documentElement.setAttribute('data-theme', theme)
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** The new theme spreads from `origin` as a growing circle over the old one. */
async function revealFrom(origin: ThemeSwitchOrigin, apply: () => void) {
  const transition = document.startViewTransition(apply)
  await transition.ready
  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  )
  const at = `at ${String(origin.x)}px ${String(origin.y)}px`
  // The Web Animations API directly: Motion runs on it, but its animate() can't target the
  // view transition's pseudo-elements.
  await document.documentElement.animate(
    { clipPath: [`circle(0px ${at})`, `circle(${String(radius)}px ${at})`] },
    { duration: REVEAL_MS, easing: REVEAL_EASING, pseudoElement: '::view-transition-new(root)' },
  ).finished
}

function blend(apply: () => void) {
  const root = document.documentElement
  root.classList.add(BLEND_CLASS)
  apply()
  window.setTimeout(() => {
    root.classList.remove(BLEND_CLASS)
  }, BLEND_MS)
}

/**
 * The visitor's theme choice and a setter. The choice lives in browser storage; the pre-paint
 * script (THEME_SCRIPT) applies it on load, this hook on change: revealed from the button where
 * View Transitions exist, blended otherwise, instant under reduced motion. With "auto", the page
 * follows the device switching between light and dark.
 */
export function useTheme() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => 'auto' as const)

  useEffect(() => {
    if (choice !== 'auto') return
    const query = window.matchMedia(DARK_SCHEME_QUERY)
    const follow = () => {
      applyTheme('auto')
    }
    query.addEventListener('change', follow)
    return () => {
      query.removeEventListener('change', follow)
    }
  }, [choice])

  const setChoice = useCallback((next: ThemeChoice, origin?: ThemeSwitchOrigin) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked: the theme still changes for this page.
    }
    const apply = () => {
      applyTheme(next)
      window.dispatchEvent(new Event(CHANGE_EVENT))
    }
    // Feature check: View Transitions are missing in some browsers (and in jsdom).
    const canReveal = origin && typeof document.startViewTransition === 'function'
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      apply()
    } else if (canReveal) {
      void revealFrom(origin, apply)
    } else {
      blend(apply)
    }
  }, [])

  return { choice, setChoice }
}
