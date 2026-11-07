'use client'

import { AnimatePresence, motion, type Variants } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'

import { EXIT_TRANSITION, SPRING } from './motion-presets'

/** An item arrives growing into place, leaves shrinking away; the rest glide to their new place. */
const ITEM_VARIANTS: Variants = {
  closed: { opacity: 0, scale: 0.94 },
  open: { opacity: 1, scale: 1, transition: SPRING },
  exit: { opacity: 0, scale: 0.94, transition: EXIT_TRANSITION },
}

export type AnimatedListProps = {
  /** An ordered list (`ol`) when the order means something, e.g. fixtures by date. */
  as?: 'ul' | 'ol'
  className?: string
  'aria-label'?: string
  /** `AnimatedListItem`s with stable keys. */
  children: ReactNode
}

/**
 * A list or grid that animates when its items change, e.g. while filtering: items that stay glide
 * to their new places (Motion layout), new ones grow in, removed ones shrink away. Items keep
 * their place in the flow while leaving (`popLayout`), so the rest move at once.
 */
export function AnimatedList({ as = 'ul', className, children, ...props }: AnimatedListProps) {
  const List = as === 'ol' ? motion.ol : motion.ul
  return (
    <List layout className={className} {...props}>
      <AnimatePresence mode="popLayout" initial={false}>
        {children}
      </AnimatePresence>
    </List>
  )
}

export type AnimatedListItemProps = Omit<
  ComponentProps<typeof motion.li>,
  'variants' | 'initial' | 'animate' | 'exit' | 'layout'
>

/** An item of an `AnimatedList`. Give it a stable `key`. */
export function AnimatedListItem(props: AnimatedListItemProps) {
  return (
    <motion.li
      layout
      variants={ITEM_VARIANTS}
      initial="closed"
      animate="open"
      exit="exit"
      {...props}
    />
  )
}
