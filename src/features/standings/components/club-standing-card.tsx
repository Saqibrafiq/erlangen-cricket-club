import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { TeamMonogram } from '@/shared/ui/team-monogram'

import type { StandingsTableRow } from '../types'
import { useStandingsFormat } from './use-standings-format'

export type ClubStandingCardProps = {
  row: StandingsTableRow
  /** Number of teams in the table, for "4th of 10". */
  teamCount: number
  /** On overview pages: the competition the row belongs to, linking to its table. */
  competition?: { title: string; href: string }
}

/** A club team's place in one table, answering "where do we stand?" at a glance. */
export function ClubStandingCard({ row, teamCount, competition }: ClubStandingCardProps) {
  const t = useTranslations('standings.club')
  const format = useStandingsFormat()

  const stats = [
    { key: 'points', label: t('points'), value: row.points },
    { key: 'won', label: t('won'), value: row.won },
    { key: 'lost', label: t('lost'), value: row.lost },
    { key: 'netRunRate', label: t('netRunRate'), value: format.netRunRate(row.netRunRate) },
  ]

  return (
    // Container query: lays out in one row when the card itself is wide, wherever it is placed.
    <article className="@container relative overflow-hidden rounded-2xl border border-border-default bg-linear-to-br from-surface-highlight to-surface-default p-5 shadow-sm transition-shadow duration-150 has-[a:hover]:shadow-md">
      <div className="flex h-full flex-col gap-5 @2xl:flex-row @2xl:items-center @2xl:gap-10">
        <header className="flex items-center gap-3 @2xl:min-w-64">
          <TeamMonogram shortName={row.team.shortName} tone="club" size="lg" />
          <div className="min-w-0">
            <h3 className="font-semibold">{row.team.name}</h3>
            {competition && (
              <Link
                href={competition.href}
                // The link covers the whole card; the card has no other interactive content.
                className="inline-flex items-center gap-0.5 text-sm text-text-muted after:absolute after:inset-0 after:rounded-2xl hover:text-text-default"
              >
                {competition.title}
                <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
              </Link>
            )}
          </div>
        </header>

        {/* Pinned to the bottom so position and stats line up across cards of one row. */}
        <div className="mt-auto flex flex-col gap-5 @2xl:contents">
          <p className="flex flex-col items-center gap-1 @2xl:flex-1">
            <span className="font-display text-6xl leading-none font-bold text-brand-primary">
              {t('position', { position: row.position })}
            </span>
            <span className="text-sm text-text-muted">{t('ofTeams', { count: teamCount })}</span>
          </p>

          <dl className="grid grid-cols-4 gap-2 border-t border-border-default pt-4 @2xl:gap-10 @2xl:border-t-0 @2xl:border-l @2xl:pt-0 @2xl:pl-10">
            {stats.map((stat) => (
              <div key={stat.key} className="text-center">
                <dt className="text-xs font-medium tracking-wide text-text-muted uppercase">
                  {stat.label}
                </dt>
                <dd className="font-display text-2xl font-bold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </article>
  )
}
