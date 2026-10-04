import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { getClubStandings } from '../domain/get-club-standings'
import { getStandingsPath } from '../paths'
import type { CompetitionStandings } from '../types'
import { ClubStandings } from './club-standings'
import { StandingsEmptyState } from './standings-empty-state'
import { StandingsLegend } from './standings-legend'
import { StandingsTable } from './standings-table'

export type StandingsOverviewProps = {
  competitions: readonly CompetitionStandings[]
}

/**
 * The club teams' places at a glance, then every competition's table, each linking to its own
 * page. Sits below the page's h1.
 */
export function StandingsOverview({ competitions }: StandingsOverviewProps) {
  const t = useTranslations('standings')

  if (competitions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-default p-4 text-text-muted">
        {t('noCompetitions')}
      </p>
    )
  }

  const hasAnyTable = competitions.some((standings) => standings.rows.length > 0)

  return (
    <div className="space-y-12">
      <ClubStandings entries={getClubStandings(competitions, { withCompetition: true })} />

      {competitions.map(({ competition, rows }) => {
        const title = `${competition.name} ${competition.season}`
        const headingId = `standings-${competition.id}-heading`
        return (
          <section key={competition.id} aria-labelledby={headingId} className="space-y-3">
            <h2 id={headingId} className="text-2xl font-bold tracking-tight">
              <Link
                href={getStandingsPath(competition.slug)}
                className="inline-flex min-h-11 items-center gap-1 rounded-md underline-offset-4 hover:underline"
              >
                {title}
                <ChevronRight aria-hidden="true" className="size-5 text-text-muted" />
              </Link>
            </h2>
            {rows.length > 0 ? (
              <StandingsTable rows={rows} caption={title} />
            ) : (
              <StandingsEmptyState />
            )}
          </section>
        )
      })}

      {hasAnyTable && <StandingsLegend />}
    </div>
  )
}
