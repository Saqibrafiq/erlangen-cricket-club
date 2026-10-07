import { ArrowRight, CalendarCheck, Clock, Dumbbell, MapPin, Trophy } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'

import { getWeekdayDate, summariseWeek } from '../domain/week'
import type { ClubSession } from '../types'
import { SectionHeading } from '@/shared/ui/section-heading'

// Sessions alternate between two looks, so the week strip shows which day belongs to which.
const SESSION_TONES = [
  {
    day: 'bg-brand-primary text-brand-on-primary',
    icon: 'bg-brand-primary text-brand-on-primary',
    Icon: Dumbbell,
  },
  {
    day: 'bg-surface-highlight text-brand-primary ring-2 ring-brand-primary',
    icon: 'bg-surface-highlight text-brand-primary',
    Icon: Trophy,
  },
] as const

function toneOf(index: number) {
  return SESSION_TONES[index % SESSION_TONES.length] ?? SESSION_TONES[0]
}

export type MembershipScheduleProps = {
  sessions: readonly ClubSession[]
  note: string | null
  directionsHref: string
}

/** The week at a glance (training and match days), then each session's time and place. */
export function MembershipSchedule({ sessions, note, directionsHref }: MembershipScheduleProps) {
  const t = useTranslations('membership.schedule')
  const format = useFormatter()
  const weekdayName = (day: Parameters<typeof getWeekdayDate>[0], style: 'short' | 'long') =>
    format.dateTime(getWeekdayDate(day), { weekday: style })

  if (sessions.length === 0) {
    return null
  }

  return (
    <section id="schedule" aria-labelledby="schedule-heading" className="scroll-mt-24 space-y-10">
      <SectionHeading
        id="schedule-heading"
        eyebrow={t('eyebrow')}
        heading={t('heading')}
        intro={t('intro')}
      />

      {/* Visual summary only; the session cards below carry the same information as text. */}
      <ol aria-hidden="true" className="mx-auto grid max-w-3xl grid-cols-7 gap-1.5 sm:gap-3">
        {summariseWeek(sessions).map(({ day, sessionIndex }) => (
          <li
            key={day}
            className={cn(
              'flex aspect-square flex-col items-center justify-center rounded-2xl text-xs font-semibold uppercase sm:text-sm',
              sessionIndex === null ? 'bg-surface-muted text-text-muted' : toneOf(sessionIndex).day,
            )}
          >
            {weekdayName(day, 'short')}
            {sessionIndex !== null && <CalendarCheck className="mt-1 size-4" />}
          </li>
        ))}
      </ol>

      <ul className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
        {sessions.map((session, index) => {
          const tone = toneOf(index)
          return (
            <li
              key={session.title}
              className="rounded-3xl border border-border-default bg-surface-default p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn('flex size-11 items-center justify-center rounded-2xl', tone.icon)}
                >
                  <tone.Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="text-xl font-bold">{session.title}</h3>
              </div>
              <p className="mt-4 font-medium">
                {format.list(session.days.map((day) => weekdayName(day, 'long')))}
              </p>
              <p className="mt-1 flex items-center gap-2 font-display text-3xl font-bold tabular-nums">
                <Clock aria-hidden="true" className="size-6 text-brand-primary" />
                {t('time', { start: session.startTime, end: session.endTime })}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-text-muted">
                <MapPin aria-hidden="true" className="size-4 shrink-0" />
                {session.venue}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
        {note && <p>{note}</p>}
        <Link
          href={directionsHref}
          className="inline-flex min-h-11 items-center gap-1 font-medium text-brand-primary underline-offset-4 hover:underline"
        >
          {t('directions')}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  )
}
