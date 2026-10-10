'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

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
