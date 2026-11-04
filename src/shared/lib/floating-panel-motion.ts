import type { MotionProps } from 'motion/react'

/**
 * How menus and popovers open and close: a quick spring out of the corner they are anchored to
 * (Radix sets the transform origin), and a faster fade away. Under "reduce motion" the site's
 * MotionProvider keeps only the fade.
 */
export const FLOATING_PANEL_MOTION = {
  initial: { opacity: 0, scale: 0.96, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.12 } },
  transition: { type: 'spring', stiffness: 520, damping: 34 },
} as const satisfies MotionProps
