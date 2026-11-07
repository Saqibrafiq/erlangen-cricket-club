'use client'

import { CircleCheck, MapPin, Sparkles, TriangleAlert } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useFormatter, useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/cn'

import type { FixturesCsvError } from '../../domain/fixtures-csv'
import type { FixtureChange, FixturesDiff } from '../../domain/fixtures-diff'

const ROW_STAGGER_S = 0.02
const ROW_FADE_S = 0.2
/** Long schedules animate only their first rows; the rest appear at once. */
const MAX_STAGGERED_ROWS = 20

const BADGE_CLASS: Record<FixtureChange['kind'], string> = {
  new: 'bg-surface-highlight text-brand-primary',
  changed: 'border border-brand-primary text-brand-primary',
  unchanged: 'text-text-muted',
  played: 'text-text-muted',
}

function ChangeBadge({ change }: { change: FixtureChange }) {
  const t = useTranslations('fixtures.import.preview')
  const label =
    change.kind === 'changed'
      ? t('changed', { fields: change.fields.map((field) => t(`fields.${field}`)).join(', ') })
      : t(change.kind)

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        BADGE_CLASS[change.kind],
      )}
    >
      {label}
    </span>
  )
}

export type FixturesImportPreviewProps = {
  diff: FixturesDiff
}

/**
 * What the import will do, fixture by fixture in file order, with what is new to the club
 * (teams, grounds) and what will be removed called out above the list.
 */
export function FixturesImportPreview({ diff }: FixturesImportPreviewProps) {
  const t = useTranslations('fixtures.import.preview')
  const format = useFormatter()
  const prefersReducedMotion = useReducedMotion()
  const count = (kind: FixtureChange['kind']) =>
    diff.changes.filter((change) => change.kind === kind).length

  return (
    <div className="space-y-4">
      {diff.isUnchanged ? (
        <p className="flex items-center gap-2 rounded-xl bg-surface-highlight p-3 text-sm font-medium">
          <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-brand-primary" />
          {t('upToDate')}
        </p>
      ) : (
        <p className="text-sm font-semibold">
          {t('summary', {
            created: count('new'),
            updated: count('changed'),
            removed: diff.removed.length,
          })}
        </p>
      )}
      {(diff.newTeams.length > 0 || diff.newGrounds.length > 0) && (
        <p className="flex items-start gap-2 text-sm">
          <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand-primary" />
          <span>
            {diff.newTeams.length > 0 && t('newTeams', { teams: diff.newTeams.join(', ') })}{' '}
            {diff.newGrounds.length > 0 && t('newGrounds', { grounds: diff.newGrounds.join(', ') })}
          </span>
        </p>
      )}
      {diff.removed.length > 0 && (
        <p className="flex items-start gap-2 text-sm text-status-danger-text">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t('removed', {
            fixtures: diff.removed
              .map(
                (fixture) =>
                  `${fixture.homeShortName} v ${fixture.awayShortName} (${format.dateTime(new Date(`${fixture.day}T12:00:00Z`), { day: 'numeric', month: 'short' })})`,
              )
              .join(', '),
          })}
        </p>
      )}

      <ul className="divide-y divide-border-default rounded-xl border border-border-default">
        {diff.changes.map((change, index) => {
          const { fixture } = change
          return (
            <motion.li
              key={fixture.key}
              initial={
                prefersReducedMotion || index >= MAX_STAGGERED_ROWS ? false : { opacity: 0, y: 4 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * ROW_STAGGER_S, duration: ROW_FADE_S }}
              className={cn(
                'grid grid-cols-dated-row items-center gap-x-3 gap-y-0.5 px-3 py-2 text-sm',
                (change.kind === 'unchanged' || change.kind === 'played') && 'text-text-muted',
              )}
            >
              <span className="row-span-2 w-16 tabular-nums">
                {format.dateTime(new Date(`${fixture.day}T12:00:00Z`), {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
                {fixture.startTime && (
                  <span className="block text-xs text-text-muted">{fixture.startTime}</span>
                )}
              </span>
              <span className="font-semibold">
                {fixture.homeShortName} <span className="font-normal text-text-muted">v</span>{' '}
                {fixture.awayShortName}
              </span>
              <span className="row-span-2">
                <ChangeBadge change={change} />
              </span>
              <span className="flex min-w-0 items-center gap-1 text-xs text-text-muted">
                {fixture.ground && (
                  <>
                    <MapPin aria-hidden="true" className="size-3 shrink-0" />
                    <span className="truncate">
                      {fixture.ground.name}
                      {fixture.isHomeGround && ` · ${t('homeGround')}`}
                    </span>
                  </>
                )}
              </span>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

export type FixturesCsvErrorsProps = {
  errors: readonly FixturesCsvError[]
}

/** Everything wrong with the file at once, by line and column, so it can be fixed in one go. */
export function FixturesCsvErrors({ errors }: FixturesCsvErrorsProps) {
  const t = useTranslations('fixtures.import.fileErrors')

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
