'use client'

import { type MotionValue, motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

export type ScrollStatementProps = {
  /** The statement, read word by word. */
  text: string
  /** Visually hidden heading that names the section. */
  heading: string
  headingId: string
}

// Unread words are dim, not invisible: the whole sentence is always there to read.
const DIM_OPACITY = 0.18

type WordProps = {
  word: string
  range: [number, number]
  progress: MotionValue<number>
}

function Word({ word, range, progress }: WordProps) {
  const opacity = useTransform(progress, range, [DIM_OPACITY, 1])

  return (
    <>
      <motion.span style={{ opacity }} className="motion-reduce:opacity-100!">
        {word}
      </motion.span>{' '}
    </>
  )
}

/**
 * Apple-style statement: a large sentence pinned on screen whose words light up one by one as the
 * page scrolls. Screen readers get the sentence as one paragraph; under "reduce motion" it is a
 * plain, fully lit paragraph.
 */
export function ScrollStatement({ text, heading, headingId }: ScrollStatementProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const words = text.split(' ')

  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      className="relative h-scroll-scene bg-media-overlay text-text-on-media motion-reduce:h-auto"
    >
      <h2 id={headingId} className="sr-only">
        {heading}
      </h2>
      <div className="sticky top-16 flex h-hero items-center motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        <p className="mx-auto max-w-5xl px-4 font-display text-4xl leading-tight font-bold text-balance uppercase sm:px-6 sm:text-5xl lg:px-8 lg:text-6xl short:lg:text-5xl tall:max-w-6xl tall:xl:text-7xl">
          {words.map((word, index) => {
            // Each word lights up in its own slice of the scroll, finishing before the end.
            const start = (index / words.length) * 0.8
            return (
              <Word
                // Words can repeat; their position is their identity.
                key={index}
                word={word}
                range={[start, start + 0.8 / words.length]}
                progress={scrollYProgress}
              />
            )
          })}
        </p>
      </div>
    </section>
  )
}
