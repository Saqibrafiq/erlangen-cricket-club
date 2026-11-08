import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type ScrollRegionName =
  /** The id of the heading that names the region. */
  { labelledBy: string; label?: never } | { label: string; labelledBy?: never }

export type ScrollRegionProps = ScrollRegionName & {
  children: ReactNode
  className?: string
}

/**
 * A wide table scrolls sideways inside this region on narrow screens; the page never does
 * (CLAUDE.md §8.2). It is named and focusable, so keyboard users can scroll it with the arrow keys.
 */
export function ScrollRegion({ labelledBy, label, children, className }: ScrollRegionProps) {
  return (
    <div
      role="region"
      aria-labelledby={labelledBy}
      aria-label={label}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-reachable (WCAG 2.1.1)
      tabIndex={0}
      className={cn('overflow-x-auto', className)}
    >
      {children}
    </div>
  )
}
