'use client'

import { ArrowDown, ArrowUp, CircleCheck, Sparkles, TriangleAlert } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslations } from 'next-intl'

import type { ImportedStandingsRow, StandingsCsvError } from '../../domain/standings-csv'
import type { StandingsDiff, StandingsRowChange } from '../../domain/standings-diff'
import type { StandingsTableRow, StandingsTeam } from '../../types'
import { StandingsTable } from '../standings-table'

const ROW_STAGGER_S = 0.03
const ROW_FADE_S = 0.2

/** The table rows as visitors will see them; teams new to us show their CricClubs code. */
export function toPreviewRows(
  rows: readonly ImportedStandingsRow[],
  teams: readonly StandingsTeam[],
): StandingsTableRow[] {
  const byShortName = new Map(teams.map((team) => [team.shortName, team]))
  return rows.map(({ teamShortName, ...row }, index) => ({
    ...row,
    position: index + 1,
    // Negative ids: not saved yet, and never equal to a real team's id.
    team: byShortName.get(teamShortName) ?? {
      id: -(index + 1),
      name: teamShortName,
      shortName: teamShortName,
      isClubTeam: false,
    },
  }))
}

function ChangeBadge({ change }: { change: StandingsRowChange }) {
  const t = useTranslations('standings.import.preview')

  if (change.isNewTeam) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-highlight px-2 py-0.5 text-xs font-semibold text-brand-primary">
        <Sparkles aria-hidden="true" className="size-3" />
        {t('newTeam')}
      </span>
    )
  }
  if (change.positionChange === null) {
    return <span className="text-xs text-text-muted">{t('newInTable')}</span>
  }
  if (change.positionChange === 0) {
    return null
  }
  const isUp = change.positionChange > 0
  const Icon = isUp ? ArrowUp : ArrowDown
  return (
    <span
      className={
        isUp
          ? 'inline-flex items-center gap-0.5 text-xs font-semibold text-status-success-text'
          : 'inline-flex items-center gap-0.5 text-xs font-semibold text-status-danger-text'
      }
    >
      <Icon aria-hidden="true" className="size-3" />
      {t(isUp ? 'up' : 'down', { places: Math.abs(change.positionChange) })}
    </span>
  )
}

export type StandingsImportPreviewProps = {
  diff: StandingsDiff
  rows: readonly StandingsTableRow[]
  /** Names the table, e.g. "BCV Regionalliga Bayern 2027". */
  caption: string
}

/**
 * What the import will change, then the table exactly as visitors will see it. Changes are
 * listed first because they are what an editor checks: who moved, who is new, who dropped out.
 */
export function StandingsImportPreview({ diff, rows, caption }: StandingsImportPreviewProps) {
  const t = useTranslations('standings.import.preview')
  const prefersReducedMotion = useReducedMotion()
  const changes = diff.rows.filter(
    (change) => change.isNewTeam || change.positionChange !== 0 || change.pointsChange !== 0,
  )

  return (
    <div className="space-y-5">
      {diff.isUnchanged ? (
        <p className="flex items-center gap-2 rounded-xl bg-surface-highlight p-3 text-sm font-medium">
          <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-brand-primary" />
          {t('unchanged')}
        </p>
      ) : (
        <section aria-labelledby="import-changes-heading" className="space-y-2">
          <h3 id="import-changes-heading" className="text-sm font-semibold">
            {t('changes', { count: changes.length })}
          </h3>
          <ul className="divide-y divide-border-default rounded-xl border border-border-default">
            {changes.map((change, index) => (
              <motion.li
                key={change.teamShortName}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * ROW_STAGGER_S, duration: ROW_FADE_S }}
                className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm"
              >
                <span className="w-6 text-right text-text-muted tabular-nums">
                  {change.position}
                </span>
                <span className="font-semibold">{change.teamShortName}</span>
                <ChangeBadge change={change} />
                {change.pointsChange !== null && change.pointsChange !== 0 && (
                  <span className="ml-auto text-text-muted tabular-nums">
                    {t('points', { points: change.pointsChange })}
                    {change.matchesAdded
                      ? ` · ${t('matches', { count: change.matchesAdded })}`
                      : ''}
                  </span>
                )}
              </motion.li>
            ))}
          </ul>
          {diff.removedTeams.length > 0 && (
            <p className="flex items-start gap-2 text-sm text-status-danger-text">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {t('removed', { teams: diff.removedTeams.join(', ') })}
            </p>
          )}
        </section>
      )}
      <StandingsTable rows={rows} caption={caption} />
    </div>
  )
}

export type StandingsCsvErrorsProps = {
  errors: readonly StandingsCsvError[]
}

/** Everything wrong with the file at once, by line and column, so it can be fixed in one go. */
export function StandingsCsvErrors({ errors }: StandingsCsvErrorsProps) {
  const t = useTranslations('standings.import.fileErrors')

  return (
    <div
      role="alert"
      className="space-y-2 rounded-xl bg-status-danger-surface p-4 text-sm text-status-danger-text"
    >
      <p className="font-semibold">{t('summary', { count: errors.length })}</p>
      <ul className="list-disc space-y-1 pl-5">
        {errors.map((error) => (
          // One error per cell, column or file problem: together these identify it.
          <li key={`${error.code}-${String(error.line)}-${error.column ?? ''}`}>
            {error.line !== undefined && (
              <span className="font-medium">{t('line', { line: error.line })} </span>
            )}
            {t(error.code, { column: error.column ?? '', value: error.value ?? '' })}
          </li>
        ))}
      </ul>
    </div>
  )
}
