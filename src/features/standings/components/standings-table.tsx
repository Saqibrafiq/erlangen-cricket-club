import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { TeamMonogram } from '@/shared/ui/team-monogram'

import type { StandingsTableRow } from '../types'
import { useStandingsFormat } from './use-standings-format'

export const STANDINGS_COLUMN_IDS = [
  'position',
  'team',
  'played',
  'won',
  'lost',
  'noResult',
  'tied',
  'points',
  'winRate',
  'netRunRate',
  'runsFor',
  'runsAgainst',
] as const

export type StandingsColumnId = (typeof STANDINGS_COLUMN_IDS)[number]

type NumericColumnId = Exclude<StandingsColumnId, 'team'>

// Compact on phones so position, team and the counts up to points fit without scrolling.
const CELL_PADDING = 'px-2 py-3 sm:px-3'

export type StandingsTableProps = {
  rows: readonly StandingsTableRow[]
  /** Names the table for assistive technology, e.g. the competition. */
  caption: string
}

/** Runs in the default colour, overs muted: "1592/383.5". */
function RunsOverOvers({ runs, overs }: { runs: number; overs: string }) {
  return (
    <>
      {runs}
      <span className="text-text-muted">/{overs}</span>
    </>
  )
}

/** League table exactly as published, in published order; the ranking is the content. */
export function StandingsTable({ rows, caption }: StandingsTableProps) {
  const t = useTranslations('standings')
  const format = useStandingsFormat()

  const renderCell = (id: NumericColumnId, row: StandingsTableRow): ReactNode => {
    switch (id) {
      case 'position':
        return (
          <span
            className={cn(
              'inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold',
              row.team.isClubTeam
                ? 'bg-brand-primary text-brand-on-primary'
                : 'bg-surface-muted text-text-muted',
            )}
          >
            {row.position}
          </span>
        )
      case 'points':
        return <span className="font-display text-lg font-bold">{row.points}</span>
      case 'winRate':
        return (
          <span className="inline-flex flex-col items-end gap-1">
            {format.winRate(row.winRate)}
            {/* Decorative: the percentage next to it carries the value. */}
            <span
              aria-hidden="true"
              className="h-1 w-14 overflow-hidden rounded-full bg-surface-muted"
            >
              <span
                className="block h-full rounded-full bg-brand-primary"
                style={{ width: `${row.winRate}%` }}
              />
            </span>
          </span>
        )
      case 'netRunRate':
        return format.netRunRate(row.netRunRate)
      case 'runsFor':
        return <RunsOverOvers runs={row.runsFor} overs={row.oversFaced} />
      case 'runsAgainst':
        return <RunsOverOvers runs={row.runsAgainst} overs={row.oversBowled} />
      default:
        return row[id]
    }
  }

  return (
    // Scrolls horizontally inside its own container on narrow screens; the page never does.
    // Focusable and named so keyboard users can scroll it (the table has no interactive content).
    <div
      role="region"
      aria-label={t('tableRegion', { caption })}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region must be keyboard-reachable (WCAG 2.1.1)
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-border-default bg-surface-default shadow-sm"
    >
      <table className="w-full min-w-max border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border-default">
            {STANDINGS_COLUMN_IDS.map((id) => (
              <th
                key={id}
                scope="col"
                className={cn(
                  CELL_PADDING,
                  'sticky top-0 bg-surface-muted text-xs font-semibold tracking-wide whitespace-nowrap text-text-muted uppercase',
                  id === 'team' && 'left-0 z-20 text-left',
                  id === 'position' && 'z-10 text-center',
                  id !== 'team' && id !== 'position' && 'z-10 text-right',
                  id === 'points' && 'text-text-default',
                )}
              >
                <span aria-hidden="true">{t(`columns.${id}.short`)}</span>
                <span className="sr-only">{t(`columns.${id}.long`)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default">
          {rows.map((row) => {
            const { isClubTeam } = row.team
            // Opaque row colours: the sticky team cell must hide what scrolls beneath it.
            const rowSurface = isClubTeam
              ? 'bg-surface-highlight'
              : 'bg-surface-default group-hover:bg-surface-muted'
            return (
              <tr
                key={row.team.id}
                className={cn(
                  'group transition-colors duration-150',
                  isClubTeam && 'font-semibold',
                )}
              >
                {STANDINGS_COLUMN_IDS.map((id) =>
                  id === 'team' ? (
                    <th
                      key={id}
                      scope="row"
                      className={cn(
                        CELL_PADDING,
                        rowSurface,
                        'sticky left-0 z-10 text-left',
                        !isClubTeam && 'font-medium',
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <TeamMonogram
                          shortName={row.team.shortName}
                          tone={isClubTeam ? 'club' : 'opponent'}
                        />
                        {/* Phones show the league code; the full name stays for screen readers. */}
                        <span aria-hidden="true" className="whitespace-nowrap sm:hidden">
                          {row.team.shortName}
                        </span>
                        <span className="whitespace-nowrap max-sm:sr-only">{row.team.name}</span>
                      </span>
                    </th>
                  ) : (
                    <td
                      key={id}
                      className={cn(
                        CELL_PADDING,
                        rowSurface,
                        'whitespace-nowrap tabular-nums',
                        id === 'position' ? 'text-center' : 'text-right',
                      )}
                    >
                      {renderCell(id, row)}
                    </td>
                  ),
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
