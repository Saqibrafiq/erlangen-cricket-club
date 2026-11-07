'use client'

import { motion } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'

export type RevealProps = {
  children: ReactNode
  /** Seconds to wait after entering the viewport, e.g. to stagger cards. */
  delay?: number
  className?: string
}

// Starts a little before the element is fully visible, so it has settled once it is read.
const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

/**
 * Fades and slides its content up when it scrolls into view (once). Under "reduce motion" only
 * the fade remains (see MotionProvider).
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Later items wait a little longer, up to this many steps, so long lists don't drag. */
const MAX_STAGGER_STEPS = 6
const STAGGER_S = 0.06

export type RevealItemProps = Omit<
  ComponentProps<typeof motion.li>,
  'initial' | 'whileInView' | 'viewport' | 'transition'
> & {
  /** The item's position in its list: items reveal one after another. */
  index?: number
}

/**
 * A list item that rises into view as it scrolls in (once), a little after the one before it.
 * Use in place of `<li>` for cards in a grid or list.
 */
export function RevealItem({ index = 0, ...props }: RevealItemProps) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration: 0.5,
        delay: Math.min(index, MAX_STAGGER_STEPS) * STAGGER_S,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...props}
    />
  )
}
