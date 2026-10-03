'use client'

import { useFormatter } from 'next-intl'
import { useSyncExternalStore } from 'react'

const MINUTE_MS = 60_000

function subscribe(onChange: () => void) {
  const interval = window.setInterval(onChange, MINUTE_MS)
  return () => {
    window.clearInterval(interval)
  }
}

// Minute precision keeps the snapshot stable between ticks.
const getNow = () => Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS
// Static pages are built ahead of time, so "in 3 days" would be wrong by the time it is read.
// Render nothing on the server and fill in the live value in the browser.
const getServerNow = () => null

export type RelativeTimeProps = {
  /** ISO date-time to count down to. */
  date: string
}

/** Live "in 3 days" text, rendered only in the browser. */
export function RelativeTime({ date }: RelativeTimeProps) {
  const format = useFormatter()
  const now = useSyncExternalStore(subscribe, getNow, getServerNow)

  if (now === null) {
    return null
  }

  return <>{format.relativeTime(new Date(date), now)}</>
}
