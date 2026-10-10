'use client'

import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

export type MotionProviderProps = {
  children: ReactNode
}

/**
 * Follows the visitor's "reduce motion" setting for every Motion animation: movement (transforms)
 * is switched off, only fades remain. One place, and no server/client mismatch, because the
 * markup is the same either way (CLAUDE.md §8.2).
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
