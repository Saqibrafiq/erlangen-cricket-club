import type { ReactNode } from 'react'

export const MAIN_CONTENT_ID = 'main-content'

export type SkipLinkProps = {
  children: ReactNode
  targetId?: string
}

/** First focusable element on every page; visually hidden until focused (WCAG 2.4.1 Bypass Blocks). */
export function SkipLink({ children, targetId = MAIN_CONTENT_ID }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-md bg-brand-primary px-4 py-3 font-medium text-brand-on-primary focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
    >
      {children}
    </a>
  )
}
