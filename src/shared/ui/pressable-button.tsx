'use client'

import { motion } from 'motion/react'
import type { ComponentProps } from 'react'

import { SPRING } from './motion-presets'

/** Pressing gives way a little, on the site's spring (no movement under reduced motion). */
const PRESS = { scale: 0.97 } as const

export type PressableButtonProps = Omit<
  ComponentProps<'button'>,
  // Motion's own handlers share these names with different signatures; buttons don't use them.
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
>

/**
 * A native button with Motion's press feedback. Kept apart from Button so Button can stay a
 * server-compatible component: Radix's Slot (`asChild`) must merge onto children rendered on the
 * server, which it cannot do across a client boundary.
 */
export function PressableButton(props: PressableButtonProps) {
  return <motion.button whileTap={PRESS} transition={SPRING} {...props} />
}
