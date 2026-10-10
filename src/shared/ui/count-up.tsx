'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

export type CountUpProps = {
  /** The final value. */
  value: number
  /** Formats every frame's value, e.g. as a percentage; integers by default. */
  format?: (value: number) => string
  /** Draws the visible (animated) text, e.g. as scoreboard digits; plain text by default. */
  render?: (text: string) => ReactNode
  className?: string
}

const DURATION_SECONDS = 1.4

function formatInteger(value: number): string {
  return String(Math.round(value))
}

/**
 * A number that counts up from zero when it scrolls into view. The final value is rendered on the
 * server and for assistive technology (and stays put under reduced motion); only the visible
 * digits animate.
 */
export function CountUp({ value, format = formatInteger, render, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const shouldReduceMotion = useReducedMotion()
  const [shown, setShown] = useState<number | null>(null)

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      return
    }
    const controls = animate(0, value, {
      duration: DURATION_SECONDS,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setShown,
    })
    return () => {
      controls.stop()
    }
  }, [isInView, shouldReduceMotion, value])

  const text = format(shown ?? value)

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{render ? render(text) : text}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}
