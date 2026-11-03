'use client'

import { useTranslations } from 'next-intl'
import { useId } from 'react'

import { cn } from '@/shared/lib/cn'
import { FormField, formControlClassName } from '@/shared/ui/form-field'

import {
  COMPETITION_NAME_MAX_LENGTH,
  FIRST_SEASON,
  LAST_SEASON,
  MAX_OVERS_OPTIONS,
  NEW_COMPETITION,
  type NewCompetitionField,
  type NewCompetitionFieldErrors,
} from '../domain/competition-target'

/** A competition an import can target. */
export type TargetCompetition = {
  id: number
  name: string
  season: string
}

export type CompetitionTargetValue = {
  /** A competition id, or `NEW_COMPETITION`. */
  target: string
  newName: string
  newSeason: string
}

export type CompetitionTargetFieldsProps = {
  /** Newest season first. */
  competitions: readonly TargetCompetition[]
  /** Listed even when from an earlier season, e.g. the table the import was opened for. */
  alwaysIncludeId?: number | null
  value: CompetitionTargetValue
  onChange: (value: CompetitionTargetValue) => void
  fieldErrors?: NewCompetitionFieldErrors
}

const DEFAULT_MAX_OVERS = MAX_OVERS_OPTIONS[0]

/** The season after the newest one we have: what an editor starts in spring. */
export function getNextSeason(competitions: readonly TargetCompetition[]): string {
  const newest = Math.max(...competitions.map((competition) => Number(competition.season)))
  return String(Number.isFinite(newest) ? newest + 1 : new Date().getFullYear())
}

/** The starting value: the given competition, else the newest one, else a new competition. */
export function getInitialTarget(
  competitions: readonly TargetCompetition[],
  competitionId: number | null,
): CompetitionTargetValue {
  return {
    target: String(competitionId ?? competitions[0]?.id ?? NEW_COMPETITION),
    newName: '',
    newSeason: getNextSeason(competitions),
  }
}

/** "BCV Regionalliga Bayern 2027" for the chosen or new competition. */
export function getTargetTitle(
  competitions: readonly TargetCompetition[],
  { target, newName, newSeason }: CompetitionTargetValue,
  placeholder: string,
): string {
  if (target === NEW_COMPETITION) {
    return `${newName || placeholder} ${newSeason}`
  }
  const competition = competitions.find((candidate) => String(candidate.id) === target)
  return competition ? `${competition.name} ${competition.season}` : ''
}

/**
 * Picks the competition an import goes into: one of the current season (last season's are done),
 * or a new one (name, season, format) for the next season. Submits `competition`, `name`,
 * `season` and `maxOvers`, as `parseCompetitionImportForm` reads them.
 */
export function CompetitionTargetFields({
  competitions,
  alwaysIncludeId = null,
  value,
  onChange,
  fieldErrors = {},
}: CompetitionTargetFieldsProps) {
  const t = useTranslations('competitions.target')
  const id = useId()
  const currentSeason = competitions[0]?.season
  const options = competitions.filter(
    (option) => option.season === currentSeason || option.id === alwaysIncludeId,
  )
  const fieldId = (field: NewCompetitionField) => `${id}-${field}`
  const errorFor = (field: NewCompetitionField) => {
    const code = fieldErrors[field]
    return code ? t(`errors.${code}`) : undefined
  }

  return (
    <>
      <FormField id={`${id}-competition`} label={t('competition')}>
        {(control) => (
          <select
            {...control}
            name="competition"
            value={value.target}
            onChange={(event) => {
              onChange({ ...value, target: event.target.value })
            }}
            className={formControlClassName}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} {option.season}
              </option>
            ))}
            <option value={NEW_COMPETITION}>{t('option')}</option>
          </select>
        )}
      </FormField>

      {value.target === NEW_COMPETITION && (
        <fieldset className="space-y-4 rounded-2xl border border-border-default p-4">
          <legend className="px-1 text-sm font-semibold">{t('legend')}</legend>
          <FormField
            id={fieldId('name')}
            label={t('name')}
            hint={t('nameHint')}
            error={errorFor('name')}
          >
            {(control) => (
              <input
                {...control}
                name="name"
                required
                autoComplete="off"
                maxLength={COMPETITION_NAME_MAX_LENGTH}
                value={value.newName}
                onChange={(event) => {
                  onChange({ ...value, newName: event.target.value })
                }}
                className={formControlClassName}
              />
            )}
          </FormField>
          <div className="grid gap-4 sm:grid-cols-aside-content">
            <FormField id={fieldId('season')} label={t('season')} error={errorFor('season')}>
              {(control) => (
                <input
                  {...control}
                  name="season"
                  type="number"
                  inputMode="numeric"
                  required
                  min={FIRST_SEASON}
                  max={LAST_SEASON}
                  value={value.newSeason}
                  onChange={(event) => {
                    onChange({ ...value, newSeason: event.target.value })
                  }}
                  className={cn(formControlClassName, 'tabular-nums')}
                />
              )}
            </FormField>
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">{t('format')}</legend>
              <div className="flex gap-2">
                {MAX_OVERS_OPTIONS.map((overs) => (
                  <label
                    key={overs}
                    className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-border-default px-3 font-medium transition-colors duration-150 has-checked:border-brand-primary has-checked:bg-surface-highlight has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring"
                  >
                    <input
                      type="radio"
                      name="maxOvers"
                      value={overs}
                      defaultChecked={overs === DEFAULT_MAX_OVERS}
                      className="sr-only"
                    />
                    {t('overs', { overs })}
                  </label>
                ))}
              </div>
              {errorFor('maxOvers') && (
                <p className="text-sm font-medium text-status-danger-text">
                  {errorFor('maxOvers')}
                </p>
              )}
            </fieldset>
          </div>
        </fieldset>
      )}
    </>
  )
}
