'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'

export type HeroScrollProps = {
  children: ReactNode
}

/**
 * Apple-style hero: the hero stays pinned while the page slides up over it, and it shrinks a
 * little and dims as it is covered. It pins once its bottom reaches the bottom of the screen, so
 * a hero taller than the screen (phones) is seen in full first. Under "reduce motion" it is a
 * normal, unpinned section.
 */
export function HeroScroll({ children }: HeroScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['end end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.7])

  // Sticky offset: 0 when the hero fits the screen, negative (pin at its bottom) when taller.
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => {
      setTop(Math.min(0, window.innerHeight - element.offsetHeight))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div ref={ref} style={{ top }} className="sticky z-0 overflow-hidden motion-reduce:static">
      <motion.div style={{ scale }} className="origin-top motion-reduce:transform-none!">
        {children}
      </motion.div>
      {/* Darkens the hero as the next section covers it. */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: dim }}
        className="pointer-events-none absolute inset-0 bg-media-overlay motion-reduce:hidden"
      />
    </div>
  )
}
