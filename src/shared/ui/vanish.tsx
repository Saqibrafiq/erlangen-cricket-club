'use client'

import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { type ReactNode, useEffect, useId } from 'react'

import { cn } from '@/shared/lib/cn'

export type VanishProps = {
  /** Start the effect; `onVanished` is called once it has finished. */
  isVanishing: boolean
  onVanished?: () => void
  className?: string
  children: ReactNode
}

/** How far the noise pushes pixels apart at the end: large enough to read as dust. */
const DUST_SCALE = 220
const DURATION_S = 1.4
/** Reduced motion: no distortion or drift, a short fade only. */
const FADE_S = 0.25

/**
 * Wraps something that can be deleted. When it goes, it crumbles into dust and drifts away, like
 * the snap in Avengers: Endgame: an SVG noise filter tears it apart while it fades and blows to
 * the side. Under reduced motion it simply fades out.
 */
export function Vanish({ isVanishing, onVanished, className, children }: VanishProps) {
  const filterId = `vanish-${useId().replace(/:/g, '')}`
  const prefersReducedMotion = useReducedMotion()
  const scale = useMotionValue(0)

  useEffect(() => {
    if (!isVanishing || prefersReducedMotion) {
      return
    }
    const controls = animate(scale, DUST_SCALE, { duration: DURATION_S, ease: 'easeIn' })
    return () => {
      controls.stop()
    }
  }, [isVanishing, prefersReducedMotion, scale])

  return (
    <motion.div
      className={cn('relative', className)}
      style={isVanishing && !prefersReducedMotion ? { filter: `url(#${filterId})` } : undefined}
      animate={
        isVanishing
          ? prefersReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, x: 60, y: -30, rotate: 2, scale: 1.04 }
          : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
      }
      transition={
        prefersReducedMotion
          ? { duration: FADE_S }
          : { duration: DURATION_S, ease: [0.55, 0, 1, 0.45] }
      }
      onAnimationComplete={() => {
        if (isVanishing) onVanished?.()
      }}
      aria-hidden={isVanishing || undefined}
    >
      {isVanishing && !prefersReducedMotion && (
        <svg aria-hidden="true" className="absolute size-0">
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={3} seed={7} />
            <motion.feDisplacementMap
              in="SourceGraphic"
              xChannelSelector="R"
              yChannelSelector="G"
              scale={scale}
            />
          </filter>
        </svg>
      )}
      {children}
    </motion.div>
  )
}
