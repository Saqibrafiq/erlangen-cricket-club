'use client'

import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'

import { getCountdown } from '../domain/countdown'
import { ScoreboardDigits } from './scoreboard-digits'

export type MatchCountdownProps = {
  /** Kick-off as ISO date-time; `null` while there is no match or no start time (shows "--"). */
  kickoff: string | null
}

const TICK_MS = 1000
const UNITS = ['days', 'hours', 'minutes', 'seconds'] as const
// En dashes: the plain hyphen is too short to read as "not set" on the board.
const PLACEHOLDER = '––'

function subscribe(onTick: () => void): () => void {
  const timer = window.setInterval(onTick, TICK_MS)
  return () => {
    window.clearInterval(timer)
  }
}

// Second precision, so the snapshot only changes when the display does.
function getSecond(): number {
  return Math.floor(Date.now() / TICK_MS)
}

// The page is static: the server cannot know "now", so the digits light up after hydration.
function getServerSecond(): null {
  return null
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** Days, hours, minutes and seconds to kick-off on the scoreboard, ticking every second. */
export function MatchCountdown({ kickoff }: MatchCountdownProps) {
  const t = useTranslations('home.nextMatch')
  const second = useSyncExternalStore(subscribe, getSecond, getServerSecond)

  const countdown =
    kickoff && second !== null ? getCountdown(new Date(kickoff), new Date(second * TICK_MS)) : null

  if (kickoff !== null && second !== null && countdown === null) {
    return <p className="font-display text-4xl font-bold text-led uppercase">{t('today')}</p>
  }

  return (
    // Not a live region: announcing every second would drown out everything else.
    <dl className="grid grid-cols-4 gap-x-2 gap-y-2 sm:gap-x-4">
      {UNITS.map((unit) => {
        const value = countdown ? pad(countdown[unit]) : PLACEHOLDER
        return (
          // Label first in the markup (as a description list requires); the digits are on top.
          <div key={unit} className="flex flex-col items-center gap-2">
            <dt className="text-xs opacity-75">{t(unit, { count: countdown?.[unit] ?? 0 })}</dt>
            <dd className="order-first">
              <ScoreboardDigits value={value} isAnimated />
              <span className="sr-only">{value}</span>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
