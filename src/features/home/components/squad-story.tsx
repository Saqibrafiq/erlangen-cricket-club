'use client'

import { type MotionValue, motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { type ReactNode, useRef } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

export type SquadStoryPlayer = {
  id: number
  name: string
  href: string
  photo: { url: string; width: number; height: number } | null
}

export type SquadStoryProps = {
  players: readonly SquadStoryPlayer[]
  heading: string
  text: string
  more: { label: string; href: string }
  /** Visually hidden heading id, for the section label. */
  headingId: string
}

// Scroll distance per player while the stage is pinned: long enough to see each one arrive.
const SCROLL_PER_PLAYER_SVH = 30
// The players arrive between these points of the section's scroll progress.
const FIRST_ENTRY = 0.05
const ENTRY_SPAN = 0.6
const ENTRY_LENGTH = 0.18

type FigureProps = {
  player: SquadStoryPlayer
  index: number
  count: number
  progress: MotionValue<number>
}

function Figure({ player, index, count, progress }: FigureProps) {
  const start = FIRST_ENTRY + (index / count) * ENTRY_SPAN
  const range = [start, start + ENTRY_LENGTH]
  const opacity = useTransform(progress, range, [0, 1])
  const y = useTransform(progress, range, [120, 0])
  const scale = useTransform(progress, range, [0.85, 1])
  // Middle players stand in front, like a team photo.
  const isCentre = Math.abs(index - (count - 1) / 2) < 1

  return (
    <motion.li
      style={{ opacity, y, scale }}
      className={cn(
        // Every figure shares the stage width and stands as tall as the stage allows.
        // Everyone the editors picked stands in the line-up, on phones as a close team-photo crowd.
        'relative -mx-4 aspect-3/4 max-w-60 min-w-0 flex-1 origin-bottom sm:-mx-4',
        // Reduced motion: everyone is simply there.
        'motion-reduce:transform-none! motion-reduce:opacity-100!',
        isCentre ? 'z-10' : 'z-0',
      )}
    >
      <Link
        href={player.href}
        className="group relative block size-full focus-visible:outline-none"
      >
        {player.photo ? (
          // On phones the picture is wider than its slot, so the figures stand taller and
          // overlap like a team photo instead of shrinking to fit the narrow screen.
          <span className="absolute bottom-0 left-1/2 h-full w-9/4 -translate-x-1/2 sm:w-full">
            <Image
              src={player.photo.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 240px, 45vw"
              className="object-contain object-bottom drop-shadow-2xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-2"
            />
          </span>
        ) : null}
        <span className="absolute inset-x-0 bottom-2 mx-auto w-fit rounded-full bg-media-overlay/70 px-2.5 py-1 text-2xs font-semibold whitespace-nowrap opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 group-focus-visible:outline-2 group-focus-visible:outline-focus-ring sm:text-xs">
          {player.name}
        </span>
      </Link>
    </motion.li>
  )
}

/**
 * The squad as a pinned scene: the stage stays on screen while scrolling and the players step in
 * one after another, like a team line-up. Under "reduce motion" it is a plain, unpinned section.
 */
export function SquadStory({
  players,
  heading,
  text,
  more,
  headingId,
}: SquadStoryProps): ReactNode {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const withPhotos = players.filter((player) => player.photo !== null)

  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      // The pinned stage needs scroll room, which depends on the number of players.
      style={{ height: `${String(100 + withPhotos.length * SCROLL_PER_PLAYER_SVH)}svh` }}
      className="relative motion-reduce:h-auto!"
    >
      <div className="sticky top-16 flex h-hero flex-col justify-center overflow-hidden bg-linear-to-b from-media-overlay via-brand-surface to-media-overlay text-text-on-media motion-reduce:static motion-reduce:h-auto">
        <div aria-hidden="true" className="absolute inset-0 bg-dots-on-media" />
        <div className="relative mx-auto w-full max-w-7xl space-y-4 px-4 text-center sm:px-6 lg:px-8">
          <h2
            id={headingId}
            className="font-display text-5xl leading-none font-bold tracking-tight uppercase sm:text-7xl lg:text-8xl"
          >
            {heading}
          </h2>
          <p className="mx-auto max-w-xl text-lg opacity-90">{text}</p>
          <Link
            href={more.href}
            className="inline-flex min-h-11 items-center gap-1 font-semibold underline-offset-4 hover:underline"
          >
            {more.label}
          </Link>
        </div>
        <ul className="relative mx-auto mt-8 flex w-full max-w-6xl shrink-0 items-end justify-center mask-fade-bottom px-8">
          {withPhotos.map((player, index) => (
            <Figure
              key={player.id}
              player={player}
              index={index}
              count={withPhotos.length}
              progress={scrollYProgress}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}
