'use client'

import { ImageUp, LoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  type SubmitEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { FormField, formControlClassName } from '@/shared/ui/form-field'

import { getInitials } from '../../domain/players'
import {
  BATTING_STYLES,
  BIO_MAX_LENGTH,
  BOWLING_STYLES,
  CLUB_OFFICES,
  CONSENT_NOTE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHOTO_TYPES,
  PLAYING_ROLES,
  type PlayerFormField,
} from '../../domain/player-form'
import type { PlayerDraft, SavePlayerResult, TeamOption } from '../../editor-types'
import type { BowlingStyle } from '../../types'
import { type CutOut, usePortraitPhoto } from './use-portrait-photo'

export type SavedPlayer = Extract<SavePlayerResult, { status: 'saved' }>['player']

export type PlayerFormProps = {
  /** The player to edit, or `null` to add one. */
  draft: PlayerDraft | null
  teams: readonly TeamOption[]
  locale: string
  loginHref: string
  save: (formData: FormData) => Promise<SavePlayerResult>
  onSaved: (player: SavedPlayer, name: string) => void
  onCancel: () => void
  /** Saved, and the page is being refreshed: the form stays busy until it closes. */
  isFinishing?: boolean
  /** Background removal; the model by default, a stand-in in tests and stories. */
  cutOut?: CutOut
}

const SPIN: readonly BowlingStyle[] = [
  'right-arm-off-spin',
  'right-arm-leg-spin',
  'left-arm-orthodox',
  'left-arm-wrist-spin',
]
const PACE = BOWLING_STYLES.filter((style) => !SPIN.includes(style))

const CHECKBOX_CLASS = 'mt-0.5 size-5 shrink-0 accent-brand-primary'

function CheckboxRow({ children }: { children: ReactNode }) {
  return <label className="flex min-h-11 items-start gap-3 py-1">{children}</label>
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
    >
      {children}
    </div>
  )
}

/**
 * Adds or edits a player: photo, name, role and playing styles first (what changes most), then
 * teams, office, introduction, the home page line-up and the recorded consent. The photo is
 * shrunk in the browser before upload; the server validates everything again.
 */
export function PlayerForm({
  draft,
  teams,
  locale,
  loginHref,
  save,
  onSaved,
  onCancel,
  isFinishing = false,
  cutOut,
}: PlayerFormProps) {
  const t = useTranslations('players')
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [result, setResult] = useState<SavePlayerResult | null>(null)
  const [isSaving, startTransition] = useTransition()
  const isPending = isSaving || isFinishing
  const [hasConsent, setHasConsent] = useState(draft?.hasPublishConsent ?? false)
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false)
  const photo = usePortraitPhoto(cutOut)
  const isProcessingPhoto = photo.status === 'processing'

  useEffect(() => {
    if (result?.status === 'invalid') {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
  }, [result])

  const fieldErrors = result?.status === 'invalid' ? result.fieldErrors : {}
  const fieldId = (field: PlayerFormField) => `${id}-${field}`
  const errorFor = (field: PlayerFormField) => {
    const code = fieldErrors[field]
    return code ? t(`editor.errors.${code}`) : undefined
  }
  const photoUrl = isRemovingPhoto ? null : (photo.previewUrl ?? draft?.photo?.url ?? null)

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const upload = await photo.getUpload()
      if (upload) {
        formData.set('photo', upload)
      }
      const saved = await save(formData)
      if (saved.status === 'saved') {
        const name = formData.get('name')
        onSaved(saved.player, typeof name === 'string' ? name.trim() : '')
        return
      }
      setResult(saved)
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
      {result?.status === 'invalid' && <Alert>{t('editor.errors.summary')}</Alert>}
      {result?.status === 'error' && <Alert>{t('editor.errors.server')}</Alert>}
      {result?.status === 'unauthorized' && (
        <Alert>
          {t('editor.errors.unauthorized')}{' '}
          <Link href={loginHref} className="underline underline-offset-4">
            {t('editor.errors.signIn')}
          </Link>
        </Alert>
      )}

      {draft && <input type="hidden" name="id" value={draft.id} />}
      <input type="hidden" name="locale" value={locale} />

      <FormField
        id={fieldId('photo')}
        label={t('editor.form.photo')}
        hint={t('editor.form.photoHint')}
        error={errorFor('photo')}
      >
        {(control) => (
          <div className="flex items-center gap-4">
            <div className="relative flex size-24 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-linear-to-b from-brand-surface to-media-overlay">
              {photoUrl ? (
                // A local preview (blob: URL) or the stored photo; not worth next/image here.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-contain object-bottom" />
              ) : (
                <span
                  aria-hidden="true"
                  className="self-center font-display text-3xl font-bold text-text-on-media"
                >
                  {getInitials(draft?.name ?? '')}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <input
                {...control}
                name="photo"
                type="file"
                accept={PHOTO_TYPES.join(',')}
                disabled={isRemovingPhoto}
                onChange={(event) => {
                  photo.choose(event.target.files?.[0] ?? null)
                }}
                className="peer sr-only"
              />
              <label
                htmlFor={control.id}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border-default px-4 font-medium transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:bg-surface-muted"
              >
                <ImageUp aria-hidden="true" className="size-4" />
                {photoUrl ? t('editor.form.changePhoto') : t('editor.form.choosePhoto')}
              </label>
              {draft?.photo ? (
                <CheckboxRow>
                  <input
                    type="checkbox"
                    name="removePhoto"
                    checked={isRemovingPhoto}
                    onChange={(event) => {
                      setIsRemovingPhoto(event.target.checked)
                    }}
                    className={CHECKBOX_CLASS}
                  />
                  <span className="text-sm">{t('editor.form.removePhoto')}</span>
                </CheckboxRow>
              ) : (
                photo.status === 'none' && (
                  <p className="text-sm text-text-muted">{t('editor.form.noPhoto')}</p>
                )
              )}
              {!isRemovingPhoto && (
                <CheckboxRow>
                  <input
                    type="checkbox"
                    checked={photo.shouldRemoveBackground}
                    onChange={(event) => {
                      photo.setShouldRemoveBackground(event.target.checked)
                    }}
                    className={CHECKBOX_CLASS}
                  />
                  <span className="text-sm">{t('editor.form.removeBackground')}</span>
                </CheckboxRow>
              )}
            </div>
          </div>
        )}
      </FormField>
      <p role="status" className="-mt-3 text-sm empty:hidden">
        {isProcessingPhoto && (
          <span className="inline-flex items-center gap-2 text-text-muted">
            <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
            {t('editor.form.removingBackground')}
          </span>
        )}
        {photo.status === 'cutOut' && (
          <span className="text-brand-primary">{t('editor.form.backgroundRemoved')}</span>
        )}
        {photo.status === 'failed' && (
          <span className="text-status-danger-text">{t('editor.form.backgroundFailed')}</span>
        )}
      </p>

      <FormField id={fieldId('name')} label={t('editor.form.name')} error={errorFor('name')}>
        {(control) => (
          <input
            {...control}
            name="name"
            required
            autoComplete="off"
            maxLength={NAME_MAX_LENGTH}
            defaultValue={draft?.name}
            className={formControlClassName}
          />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id={fieldId('playingRole')}
          label={t('editor.form.role')}
          error={errorFor('playingRole')}
        >
          {(control) => (
            <select
              {...control}
              name="playingRole"
              defaultValue={draft?.playingRole ?? ''}
              className={formControlClassName}
            >
              <option value="">{t('editor.form.notSet')}</option>
              {PLAYING_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`playingRole.${role}`)}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField
          id={fieldId('bowlingStyle')}
          label={t('editor.form.bowling')}
          error={errorFor('bowlingStyle')}
        >
          {(control) => (
            <select
              {...control}
              name="bowlingStyle"
              defaultValue={draft?.bowlingStyle ?? ''}
              className={formControlClassName}
            >
              <option value="">{t('editor.form.notSet')}</option>
              <optgroup label={t('editor.form.pace')}>
                {PACE.map((style) => (
                  <option key={style} value={style}>
                    {t(`bowlingStyle.${style}`)}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('editor.form.spin')}>
                {SPIN.map((style) => (
                  <option key={style} value={style}>
                    {t(`bowlingStyle.${style}`)}
                  </option>
                ))}
              </optgroup>
            </select>
          )}
        </FormField>
        {/* Below both fields it explains, so Role and Bowling style line up. */}
        <p className="-mt-3 text-sm text-text-muted sm:col-span-2">{t('editor.form.roleHint')}</p>
        <FormField
          id={fieldId('battingStyle')}
          label={t('editor.form.batting')}
          error={errorFor('battingStyle')}
        >
          {(control) => (
            <select
              {...control}
              name="battingStyle"
              defaultValue={draft?.battingStyle ?? ''}
              className={formControlClassName}
            >
              <option value="">{t('editor.form.notSet')}</option>
              {BATTING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {t(`battingStyle.${style}`)}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField
          id={fieldId('clubOffice')}
          label={t('editor.form.office')}
          error={errorFor('clubOffice')}
        >
          {(control) => (
            <select
              {...control}
              name="clubOffice"
              defaultValue={draft?.clubOffice ?? ''}
              className={formControlClassName}
            >
              <option value="">{t('editor.form.notSet')}</option>
              {CLUB_OFFICES.map((office) => (
                <option key={office} value={office}>
                  {t(`office.${office}`)}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      {teams.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium">{t('editor.form.teams')}</legend>
          <div className="mt-1 flex flex-wrap gap-x-6">
            {teams.map((team) => (
              <CheckboxRow key={team.id}>
                <input
                  type="checkbox"
                  name="teams"
                  value={team.id}
                  defaultChecked={draft?.teams.includes(team.id)}
                  className={CHECKBOX_CLASS}
                />
                <span>{team.name}</span>
              </CheckboxRow>
            ))}
          </div>
        </fieldset>
      )}

      <FormField
        id={fieldId('bio')}
        label={t('editor.form.bio')}
        hint={t('editor.form.bioHint', { max: BIO_MAX_LENGTH })}
        error={errorFor('bio')}
      >
        {(control) => (
          <textarea
            {...control}
            name="bio"
            rows={3}
            maxLength={BIO_MAX_LENGTH}
            defaultValue={draft?.bio ?? ''}
            className={formControlClassName}
          />
        )}
      </FormField>

      <CheckboxRow>
        <input
          type="checkbox"
          name="isFeaturedOnHome"
          defaultChecked={draft?.isFeaturedOnHome}
          className={CHECKBOX_CLASS}
        />
        <span>{t('editor.form.featured')}</span>
      </CheckboxRow>

      <div className="space-y-3 rounded-xl border border-border-default p-4">
        <CheckboxRow>
          <input
            type="checkbox"
            name="hasPublishConsent"
            checked={hasConsent}
            onChange={(event) => {
              setHasConsent(event.target.checked)
            }}
            aria-describedby={`${id}-consent-hint`}
            className={CHECKBOX_CLASS}
          />
          <span className="font-medium">{t('editor.form.consent')}</span>
        </CheckboxRow>
        {/* Outside the label, so the checkbox's name stays short; linked as its description. */}
        <p id={`${id}-consent-hint`} className="-mt-2 pl-8 text-sm text-text-muted">
          {t('editor.form.consentHint')}
        </p>
        {hasConsent && (
          <FormField
            id={fieldId('consentNote')}
            label={t('editor.form.consentNote')}
            hint={t('editor.form.consentNoteHint')}
            error={errorFor('consentNote')}
          >
            {(control) => (
              <input
                {...control}
                name="consentNote"
                required
                maxLength={CONSENT_NOTE_MAX_LENGTH}
                defaultValue={draft?.consentNote ?? ''}
                className={formControlClassName}
              />
            )}
          </FormField>
        )}
      </div>

      <div
        className={cn(
          'sticky bottom-0 -mx-6 flex gap-3 border-t border-border-default bg-surface-default px-6 py-4',
        )}
      >
        <Button type="submit" disabled={isPending || isProcessingPhoto} aria-busy={isPending}>
          {isPending ? t('editor.form.saving') : t('editor.form.save')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          {t('editor.form.cancel')}
        </Button>
      </div>
    </form>
  )
}
