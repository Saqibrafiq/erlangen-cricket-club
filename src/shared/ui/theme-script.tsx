'use client'

import { useLayoutEffect, useSyncExternalStore } from 'react'

import { THEME_SCRIPT } from '@/shared/config/theme'
import { applyStoredTheme } from '@/shared/lib/use-theme'

// Nothing to listen to: only "server render or hydration" versus "rendered in the browser" matters.
const subscribe = () => () => undefined
const inBrowser = () => false
const onServer = () => true

/**
 * The inline script that applies the chosen theme before the first paint (ADR-0020). It is part of
 * the server's HTML and kept on hydration, so it runs before anything is shown. When the layout is
 * rendered again in the browser (e.g. switching language), it renders nothing: React never creates
 * a script element there (it would not run, and React warns about it). It applies the stored
 * theme again instead, before that render paints, as re-rendering <html> drops the attribute.
 */
export function ThemeScript() {
  const isServerHtml = useSyncExternalStore(subscribe, inBrowser, onServer)
  useLayoutEffect(() => {
    if (!isServerHtml) applyStoredTheme()
  }, [isServerHtml])
  if (!isServerHtml) return null
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
}
