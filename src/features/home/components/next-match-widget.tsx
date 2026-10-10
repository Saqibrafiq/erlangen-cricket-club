import { CalendarDays, CalendarPlus, Clock, MapPin, Navigation } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { FIXTURES_PATH, type FixtureSummary, getVenueKind } from '@/features/fixtures'
import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { TeamMonogram } from '@/shared/ui/team-monogram'

import { getDirectionsUrl } from '../domain/home'
import type { NextMatchLinks } from '../types'
import { MatchCountdown } from './match-countdown'

export type NextMatchWidgetProps = {
  /** The next featured match, or `null` between seasons (everything shows "TBD"). */
  fixture: FixtureSummary | null
  links: NextMatchLinks | null
  /** The coming season ("2027") for the "fixtures coming soon" line between seasons. */
  nextSeason: string | null
}

type TeamProps = {
  shortName: string
  name: string
  isClubTeam: boolean
}

// Both teams look the same: badge and name. Only the badge colour tells the club apart.
function Team({ shortName, name, isClubTeam }: TeamProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <TeamMonogram
        shortName={shortName}
        tone={isClubTeam ? 'club' : 'opponent'}
        size="lg"
        className="size-16 text-xl ring-4 ring-text-on-media/15 sm:size-20 short:lg:size-14"
      />
      <span className="font-display text-lg leading-tight font-bold text-balance uppercase sm:text-xl">
        {name}
      </span>
    </div>
  )
}

type DetailProps = {
  icon: ReactNode
  label: string
  children: ReactNode
  className?: string
}

function Detail({ icon, label, children, className }: DetailProps) {
  return (
    // Only dt and dd in the group, as a description list requires: the icon is part of the term.
    <div
      className={cn(
        'relative min-w-0 rounded-2xl bg-media-overlay/40 py-3.5 pr-3.5 pl-16 short:lg:py-2.5',
        className,
      )}
    >
      <dt className="text-xs opacity-75">
        <span className="absolute top-1/2 left-3.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-xl bg-text-on-media/10">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="font-semibold wrap-break-word">{children}</dd>
    </div>
  )
}

/**
 * The next match on the hero, as a glass card: both teams, an LED countdown ticking every second,
 * date, kick-off and ground, with "add to calendar" and directions. Between seasons the same card
 * shows "TBD", so nothing jumps when the fixtures arrive.
 */
export function NextMatchWidget({ fixture, links, nextSeason }: NextMatchWidgetProps) {
  const t = useTranslations('home.nextMatch')
  const format = useFormatter()
  const venueKind = fixture ? getVenueKind(fixture.venue) : null
  const tbd = t('tbd')
  const [left, right] = fixture
    ? fixture.teams
    : ([
        { shortName: 'ECC', name: t('clubTbd'), isClubTeam: true },
        { shortName: '?', name: t('opponentTbd'), isClubTeam: false },
      ] as const)

  return (
    <article
      aria-labelledby="next-match-heading"
      className="relative overflow-hidden rounded-3xl bg-text-on-media/10 p-5 text-text-on-media shadow-2xl ring-1 ring-text-on-media/20 backdrop-blur-xl sm:p-7 short:lg:p-5"
    >
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 size-64 rounded-full bg-brand-primary/50 blur-3xl"
      />
      <div className="relative space-y-6 short:lg:space-y-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="next-match-heading" className="font-display text-2xl font-bold uppercase">
              {t('label')}
            </h2>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-sm font-semibold',
                venueKind === 'home'
                  ? 'bg-text-on-media text-media-overlay'
                  : 'bg-text-on-media/15 ring-1 ring-text-on-media/20',
              )}
            >
              {venueKind ? t(venueKind) : tbd}
            </span>
          </div>
          <p className="text-sm opacity-80">
            {fixture
              ? fixture.competition.name
              : nextSeason
                ? t('comingSoonSeason', { season: nextSeason })
                : t('comingSoon')}
          </p>
        </div>

        <div className="grid grid-cols-versus items-start gap-3">
          <Team {...left} />
          <span
            aria-hidden="true"
            className="pt-5 font-display text-2xl font-bold opacity-60 sm:pt-7"
          >
            {t('versus')}
          </span>
          <Team {...right} />
        </div>

        <MatchCountdown kickoff={links?.kickoff ?? null} />

        <dl className="grid grid-cols-2 gap-2.5">
          <Detail icon={<CalendarDays aria-hidden="true" className="size-4" />} label={t('date')}>
            {fixture
              ? format.dateTime(new Date(fixture.date), {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              : tbd}
          </Detail>
          <Detail icon={<Clock aria-hidden="true" className="size-4" />} label={t('time')}>
            {fixture?.startTime ?? tbd}
          </Detail>
          <Detail
            icon={<MapPin aria-hidden="true" className="size-4" />}
            label={t('venue')}
            className="col-span-2"
          >
            {fixture?.venue ?? tbd}
          </Detail>
        </dl>

        {fixture && links ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="on-media">
              <a href={links.calendarHref} download>
                <CalendarPlus aria-hidden="true" />
                {t('addToCalendar')}
              </a>
            </Button>
            {fixture.venue && (
              <Button asChild variant="on-media-outline">
                <a
                  href={getDirectionsUrl(fixture.venue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('directionsTo', { venue: fixture.venue })}
                >
                  <Navigation aria-hidden="true" />
                  {t('directions')}
                </a>
              </Button>
            )}
          </div>
        ) : (
          <Button asChild variant="on-media-outline">
            <Link href={FIXTURES_PATH}>{t('lastSeason')}</Link>
          </Button>
        )}
      </div>
    </article>
  )
}
