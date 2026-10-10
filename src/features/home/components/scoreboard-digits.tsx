'use client'

import { AnimatePresence, motion } from 'motion/react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/cn'

const cellVariants = cva(
  'relative grid place-items-center overflow-hidden rounded-md bg-scoreboard font-display leading-none font-bold tabular-nums ring-1 inset-shadow-recessed ring-text-on-media/10',
  {
    variants: {
      size: {
        md: 'h-12 w-8 text-4xl sm:h-14 sm:w-10 sm:text-5xl short:lg:h-11 short:lg:w-8 short:lg:text-4xl',
        lg: 'h-16 w-11 text-6xl sm:h-20 sm:w-14 sm:text-7xl',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export type ScoreboardDigitsProps = VariantProps<typeof cellVariants> & {
  /** What the board shows, e.g. "03", "--" or "55%". */
  value: string
  /** Flip each changed digit in (the countdown); static values do not move. */
  isAnimated?: boolean
  className?: string
}

// Unlit segments show behind digits and dashes, like a real LED board.
const GHOST = '8'
const HAS_GHOST = /[0-9–-]/

/**
 * A value on the ground scoreboard: one dark cell per character, amber LED dots, the unlit "8"
 * faintly behind. Decorative only: callers give the value as text for assistive technology.
 */
export function ScoreboardDigits({
  value,
  size,
  isAnimated = false,
  className,
}: ScoreboardDigitsProps) {
  // One cell per visible character; spaces (e.g. German "55 %") are dropped: cells have gaps.
  const characters = value.match(/\S/gu) ?? []

  return (
    <span aria-hidden="true" className={cn('inline-flex gap-1', className)}>
      {characters.map((character, index) => (
        // Position is the identity: the cell stays, its digit changes.
        <span key={index} className={cellVariants({ size })}>
          {HAS_GHOST.test(character) && (
            <span className="absolute led-matrix text-led/10">{GHOST}</span>
          )}
          <span className="relative led-glow">
            {isAnimated ? (
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={character}
                  className="block led-matrix text-led"
                  initial={{ y: '-40%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '40%', opacity: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {character}
                </motion.span>
              </AnimatePresence>
            ) : (
              <span className="block led-matrix text-led">{character}</span>
            )}
          </span>
        </span>
      ))}
    </span>
  )
}
