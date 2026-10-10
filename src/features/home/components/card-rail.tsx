import { Children, type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export type CardRailProps = {
  /** Id of the heading that names the rail (for screen readers and keyboard users). */
  labelledBy: string
  /** Grid columns from md, e.g. "md:grid-cols-3". */
  gridClassName: string
  /** Each card is one item; give subgrid cards `itemClassName` to span their rows. */
  itemClassName?: string
  children: ReactNode
}

/**
 * Cards as a swipeable rail on phones (the next card peeks in, items snap) and as a grid from md.
 * Focusable so keyboard users can scroll it with the arrow keys.
 */
export function CardRail({ labelledBy, gridClassName, itemClassName, children }: CardRailProps) {
  return (
    // A scrollable area must be reachable by keyboard (WCAG 2.1.1; axe "scrollable-region-focusable"),
    // so the labelled group takes focus and the arrow keys scroll it (a group, not a landmark: the
    // section around it already is one).
    <div
      role="group"
      aria-labelledby={labelledBy}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      // Full-bleed on phones: the rail runs to the screen edge, cards keep the page gutter.
      // Relative, so absolutely positioned content (e.g. sr-only text) is clipped with the rail.
      className="relative -mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:overflow-visible md:px-0 md:pb-0"
    >
      <ul className={cn('flex gap-4 md:grid', gridClassName)}>
        {Children.map(children, (child) => (
          <li className={cn('w-4/5 shrink-0 snap-start sm:w-1/2 md:w-auto', itemClassName)}>
            {child}
          </li>
        ))}
      </ul>
    </div>
  )
}
