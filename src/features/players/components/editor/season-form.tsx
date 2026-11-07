'use client'

import { useTranslations } from 'next-intl'
import { type ReactNode, useId, useState, useTransition } from 'react'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'
import { FormField, formControlClassName } from '@/shared/ui/form-field'

import {
  BATTING_FIELDS,
  type BattingField,
  type BowlingCountField,
  FIRST_SEASON,
  LAST_SEASON,
  SEASON_COMPETITIONS,
  SEASON_FORMATS,
  type SeasonFieldErrors,
} from '../../domain/season-form'
import type { SaveSeasonResult, SeasonDraft } from '../../editor-types'
import type { SeasonCompetition, SeasonTeam } from '../../types'

export type SeasonFormProps = {
  playerId: number
  /** `null` when adding a season. */
  draft: SeasonDraft | null
  teams: readonly SeasonTeam[]
  loginHref: string
  save: (formData: FormData) => Promise<SaveSeasonResult>
  onSaved: (season: number) => void
  onCancel: () => void
  /** True while the page refreshes after saving. */
  isFinishing: boolean
}

const CHECKBOX_CLASS = 'mt-0.5 size-5 shrink-0 accent-brand-primary'
const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-4'

// Bowling as editors read a scorecard: overs, maidens, runs, wickets, then best figures and the rest.
const BOWLING_LAYOUT = [
  'matches',
  'innings',
  'maidens',
  'runsConceded',
  'wickets',
  'bestWickets',
  'bestRuns',
  'dotBalls',
  'fourWicketHauls',
  'fiveWicketHauls',
  'hatTricks',
  'wides',
  'noBalls',
] as const satisfies readonly BowlingCountField[]

function CheckboxRow({ children }: { children: ReactNode }) {
  return <label className="flex min-h-11 items-start gap-3 py-1">{children}</label>
}

/** The form for one season record; batting and bowling are sections switched on by a checkbox. */
export function SeasonForm({
  playerId,
  draft,
  teams,
  loginHref,
  save,
  onSaved,
  onCancel,
  isFinishing,
}: SeasonFormProps) {
  const t = useTranslations('players.seasonEditor')
  const tStats = useTranslations('players.profile.stats')
  const tColumns = useTranslations('players.profile.stats.columns')
  const id = useId()
  const [isSaving, startTransition] = useTransition()
  const isPending = isSaving || isFinishing
  const [errors, setErrors] = useState<SeasonFieldErrors>({})
  const [formError, setFormError] = useState<'save' | 'unauthorized' | null>(null)
  const [competition, setCompetition] = useState<SeasonCompetition>(draft?.competition ?? 'club')
  const [teamId, setTeamId] = useState(draft?.teamId ? String(draft.teamId) : '')
  const isTeamRecord = competition === 'club' && teamId !== ''
  const [hasBatting, setHasBatting] = useState(draft ? draft.batting !== null : true)
  const [hasBowling, setHasBowling] = useState(draft ? draft.bowling !== null : true)

  const fieldId = (name: string) => `${id}-${name.replace('.', '-')}`
  const errorFor = (name: string) => {
    const code = errors[name]
    return code ? t(`errors.${code}`) : undefined
  }

  const countField = (
    section: 'batting' | 'bowling',
    field: BattingField | BowlingCountField,
    label: string,
    value: number | undefined,
  ) => {
    const name = `${section}.${field}`
    return (
      <FormField key={name} id={fieldId(name)} label={label} error={errorFor(name)}>
        {(control) => (
          <input
            {...control}
            name={name}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            required={field === 'matches'}
            defaultValue={value ?? ''}
            className={formControlClassName}
          />
        )}
      </FormField>
    )
  }

  const bowlingLabel = (field: BowlingCountField) => {
    switch (field) {
      case 'bestWickets':
      case 'bestRuns':
      case 'dotBalls':
      case 'hatTricks':
      case 'wides':
      case 'noBalls':
        return t(`fields.${field}`)
      default:
        return tColumns(`${field}.long`)
    }
  }

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(async () => {
          const result = await save(formData)
          if (result.status === 'saved') {
            setErrors({})
            setFormError(null)
            onSaved(Number(formData.get('season')))
            return
          }
          if (result.status === 'invalid') {
            setErrors(result.fieldErrors)
            setFormError(null)
            return
          }
          setFormError(result.status === 'unauthorized' ? 'unauthorized' : 'save')
        })
      }}
    >
      <input type="hidden" name="playerId" value={playerId} />
      {draft && <input type="hidden" name="id" value={draft.id} />}

      {formError && (
        <p role="alert" className="rounded-xl bg-status-danger-surface p-4 text-status-danger-text">
          {t(`errors.${formError}`)}{' '}
          {formError === 'unauthorized' && (
            <Link href={loginHref} className="font-medium underline underline-offset-4">
              {t('errors.signIn')}
            </Link>
          )}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id={fieldId('season')} label={t('fields.season')} error={errorFor('season')}>
          {(control) => (
            <input
              {...control}
              name="season"
              type="number"
              inputMode="numeric"
              min={FIRST_SEASON}
              max={LAST_SEASON}
              required
              defaultValue={draft?.season ?? new Date().getFullYear()}
              className={formControlClassName}
            />
          )}
        </FormField>
        <FormField
          id={fieldId('competition')}
          label={t('fields.competition')}
          error={errorFor('competition')}
        >
          {(control) => (
            <select
              {...control}
              name="competition"
              value={competition}
              onChange={(event) => {
                setCompetition(event.target.value as SeasonCompetition)
              }}
              className={formControlClassName}
            >
              {SEASON_COMPETITIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`competition.${value}`)}
                </option>
              ))}
            </select>
          )}
        </FormField>
        {isTeamRecord ? (
          // A team's record always counts its league matches.
          <input type="hidden" name="format" value="all" />
        ) : (
          <FormField id={fieldId('format')} label={t('fields.format')} error={errorFor('format')}>
            {(control) => (
              <select
                {...control}
                name="format"
                defaultValue={draft?.format === 'league' ? 'all' : (draft?.format ?? 'all')}
                className={formControlClassName}
              >
                {SEASON_FORMATS.map((value) => (
                  <option key={value} value={value}>
                    {tStats(`formats.${value}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}
      </div>

      {competition === 'club' && (
        <FormField
          id={fieldId('teamId')}
          label={t('fields.team')}
          hint={t('fields.teamHint')}
          error={errorFor('teamId')}
        >
          {(control) => (
            <select
              {...control}
              name="teamId"
              value={teamId}
              onChange={(event) => {
                setTeamId(event.target.value)
              }}
              className={formControlClassName}
            >
              <option value="">{t('fields.wholeSeason')}</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
      )}

      {errors.hasBatting && (
        <p role="alert" className="text-sm font-medium text-status-danger-text">
          {t(`errors.${errors.hasBatting}`)}
        </p>
      )}

      <fieldset className="space-y-4 rounded-2xl border border-border-default p-4">
        <legend className="px-1 font-display text-lg font-bold tracking-wide uppercase">
          {tStats('batting')}
        </legend>
        <CheckboxRow>
          <input
            type="checkbox"
            name="hasBatting"
            checked={hasBatting}
            onChange={(event) => {
              setHasBatting(event.target.checked)
            }}
            className={CHECKBOX_CLASS}
          />
          <span>{t('fields.hasBatting')}</span>
        </CheckboxRow>
        {hasBatting && (
          <>
            <div className={GRID_CLASS}>
              {BATTING_FIELDS.map((field) =>
                countField('batting', field, tColumns(`${field}.long`), draft?.batting?.[field]),
              )}
            </div>
            <CheckboxRow>
              <input
                type="checkbox"
                name="batting.isHighestScoreNotOut"
                defaultChecked={draft?.batting?.isHighestScoreNotOut}
                className={CHECKBOX_CLASS}
              />
              <span>{t('fields.isHighestScoreNotOut')}</span>
            </CheckboxRow>
          </>
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-border-default p-4">
        <legend className="px-1 font-display text-lg font-bold tracking-wide uppercase">
          {tStats('bowling')}
        </legend>
        <CheckboxRow>
          <input
            type="checkbox"
            name="hasBowling"
            checked={hasBowling}
            onChange={(event) => {
              setHasBowling(event.target.checked)
            }}
            className={CHECKBOX_CLASS}
          />
          <span>{t('fields.hasBowling')}</span>
        </CheckboxRow>
        {hasBowling && (
          <div className={GRID_CLASS}>
            <FormField
              id={fieldId('bowling.overs')}
              label={tColumns('overs.long')}
              hint={t('fields.oversHint')}
              error={errorFor('bowling.overs')}
            >
              {(control) => (
                <input
                  {...control}
                  name="bowling.overs"
                  inputMode="decimal"
                  placeholder="110.1"
                  defaultValue={draft?.bowling?.overs ?? ''}
                  className={formControlClassName}
                />
              )}
            </FormField>
            {BOWLING_LAYOUT.map((field) =>
              countField('bowling', field, bowlingLabel(field), draft?.bowling?.[field]),
            )}
          </div>
        )}
      </fieldset>

      <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-border-default bg-surface-default px-6 py-4">
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending ? t('saving') : t('save')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  )
}
