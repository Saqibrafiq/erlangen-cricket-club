import { CalendarDays, MapPin } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import { TeamMonogram } from '@/shared/ui/team-monogram'

import type { FixtureSummary } from '../types'
import { RelativeTime } from './relative-time'

export type NextMatchProps = {
  fixture: FixtureSummary
}

/** Prominent card for the next scheduled fixture — what a player checks first. */
export function NextMatch({ fixture }: NextMatchProps) {
  const t = useTranslations('fixtures')
  const format = useFormatter()
  const [team1, team2] = fixture.teams
  const startsAt = fixture.startTime
    ? `${fixture.date.slice(0, 10)}T${fixture.startTime}`
    : fixture.date

  return (
    <section
      aria-labelledby="next-match-heading"
      className="overflow-hidden rounded-xl border border-border-default bg-surface-muted shadow-sm"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 bg-brand-primary px-5 py-3 text-brand-on-primary">
        <h2 id="next-match-heading" className="text-lg font-bold tracking-wide uppercase">
          {t('nextMatch')}
        </h2>
        <p className="text-sm font-medium">
          <RelativeTime date={startsAt} />
        </p>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-hero md:items-center">
        <p className="flex flex-col items-start gap-3 font-display text-2xl font-bold sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:text-3xl">
          <span className="flex items-center gap-3">
            <TeamMonogram
              shortName={team1.shortName}
              tone={team1.isClubTeam ? 'club' : 'opponent'}
              size="lg"
            />
            {team1.name}
          </span>
          {/* Stacked on phones: the teams speak for themselves, the "v" stays for screen readers. */}
          <span className="text-base text-text-muted max-sm:sr-only">{t('versus')}</span>
          <span className="flex items-center gap-3">
            <TeamMonogram
              shortName={team2.shortName}
              tone={team2.isClubTeam ? 'club' : 'opponent'}
              size="lg"
            />
            {team2.name}
          </span>
        </p>

        <dl className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <dt>
              <CalendarDays aria-hidden="true" className="size-4 text-text-muted" />
              <span className="sr-only">{t('when')}</span>
            </dt>
            <dd>
              <time dateTime={startsAt}>
                {format.dateTime(new Date(fixture.date), {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              {fixture.startTime && <> · {t('startTime', { time: fixture.startTime })}</>}
            </dd>
          </div>
          {fixture.venue && (
            <div className="flex items-center gap-2">
              <dt>
                <MapPin aria-hidden="true" className="size-4 text-text-muted" />
                <span className="sr-only">{t('where')}</span>
              </dt>
              <dd>{fixture.venue}</dd>
            </div>
          )}
          <div className="text-text-muted">
            <dt className="sr-only">{t('competition')}</dt>
            <dd>
              {fixture.competition.name} {fixture.competition.season}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
