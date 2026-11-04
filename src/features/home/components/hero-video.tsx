'use client'

import { useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { useSyncExternalStore } from 'react'

export const HERO_VIDEO_SRC = '/videos/hero.mp4'
/** The first frame: shown until the video plays, so nothing jumps when it starts. */
export const HERO_VIDEO_START_POSTER = '/videos/hero-start.jpg'
/** The last frame (the finished crest): the still for reduced motion and data saver. */
export const HERO_VIDEO_END_POSTER = '/videos/hero-end.jpg'

type NetworkInformation = { saveData?: boolean }

// Neither value changes while the page is open, so there is nothing to listen to.
const subscribeToNothing = () => () => undefined
const cannotLoadOnServer = () => false
const canLoadInBrowser = () => !prefersSavingData()

function prefersSavingData(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
  return connection?.saveData ?? false
}

/**
 * The hero's background film: a drone flight over the ground that ends with the club crest
 * drawing itself. It plays once, muted, and stays on the crest. Decoration only (hidden from
 * assistive technology). Under reduced motion or data saver it never loads; the finished crest
 * shows as a still instead.
 */
export function HeroVideo() {
  const isReducedMotion = useReducedMotion() ?? false
  // False on the server, so the server-rendered page never starts the download itself.
  const canLoad = useSyncExternalStore(subscribeToNothing, canLoadInBrowser, cannotLoadOnServer)
  const canPlay = canLoad && !isReducedMotion

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      {/* Fills whatever the whole film leaves free (screens shaped unlike 16:9, e.g. phones). */}
      <Image
        src={HERO_VIDEO_START_POSTER}
        alt=""
        fill
        sizes="100vw"
        className="scale-110 object-cover blur-2xl"
      />
      {/* The film, centred in the first screen below the header pill, sized so the crest it ends
          on is never cut (video-crest-stage). */}
      <div className="video-crest-stage absolute inset-x-0 top-header-offset">
        <video
          tabIndex={-1}
          muted
          playsInline
          autoPlay={canPlay}
          preload={canPlay ? 'auto' : 'none'}
          poster={isReducedMotion ? HERO_VIDEO_END_POSTER : HERO_VIDEO_START_POSTER}
          src={canPlay ? HERO_VIDEO_SRC : undefined}
          className="absolute top-1/2 left-1/2 aspect-video video-crest-fit max-w-none -translate-1/2 video-edge-fade"
        />
      </div>
    </div>
  )
}
