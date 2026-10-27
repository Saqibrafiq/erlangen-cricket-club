'use client'

import { Handshake, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  type ReactNode,
  type SubmitEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/shared/lib/cn'
import { resizeImage } from '@/shared/lib/resize-image'
import { Button } from '@/shared/ui/button'
import { FormField, formControlClassName } from '@/shared/ui/form-field'

import {
  DESCRIPTION_MAX_LENGTH,
  FIRST_SPONSOR_YEAR,
  LAST_SPONSOR_YEAR,
  NAME_MAX_LENGTH,
  SPONSOR_TIERS,
  type SponsorFormField,
} from '../../domain/sponsor-form'
import type { SaveSponsorResult, SponsorDraft } from '../../editor-types'
import type { Sponsor, SponsorTier } from '../../types'
import { SponsorCard } from '../sponsor-card'
import { LogoDropZone } from './logo-drop-zone'

export type SavedSponsor = Extract<SaveSponsorResult, { status: 'saved' }>['sponsor']

export type SponsorFormProps = {
  /** The sponsor to edit, or `null` to add one. */
  draft: SponsorDraft | null
  /** Shown in the preview: the description in the language the editor is browsing in. */
  locale: string
  loginHref: string
  save: (formData: FormData) => Promise<SaveSponsorResult>
  onSaved: (sponsor: SavedSponsor, name: string) => void
  onCancel: () => void
  /** Saved, and the page is being refreshed: the form stays busy until it closes. */
  isFinishing?: boolean
}

/** Logos are shown at most 28 × 4 px high on a card; this keeps them crisp and small. */
const LOGO_MAX_EDGE = 800
const TIER_ICONS = { title: Sparkles, sponsor: Handshake } as const satisfies Record<
  SponsorTier,
  unknown
>

type LogoPreview = { url: string; width: number; height: number }

/** Used when the browser cannot measure the image (the card scales the logo anyway). */
const FALLBACK_LOGO_SIZE = { width: 320, height: 160 }

async function measureImage(file: File): Promise<{ width: number; height: number }> {
  try {
    const bitmap = await createImageBitmap(file)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
  } catch {
    return FALLBACK_LOGO_SIZE
  }
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
 * Adds or edits a sponsor with a live preview of the card as visitors will see it. Both
 * descriptions are edited together, since the card appears in English and German.
 */
export function SponsorForm({
  draft,
  locale,
  loginHref,
  save,
  onSaved,
  onCancel,
  isFinishing = false,
}: SponsorFormProps) {
  const t = useTranslations('sponsors.editor')
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [result, setResult] = useState<SaveSponsorResult | null>(null)
  const [isSaving, startTransition] = useTransition()
  const isPending = isSaving || isFinishing
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<LogoPreview | null>(null)
  const [preview, setPreview] = useState<{
    name: string
    tier: SponsorTier
    since: string
    descriptionEn: string
    descriptionDe: string
    website: string
  }>({
    name: draft?.name ?? '',
    tier: draft?.tier ?? 'sponsor',
    since: String(draft?.since ?? new Date().getFullYear()),
    descriptionEn: draft?.descriptionEn ?? '',
    descriptionDe: draft?.descriptionDe ?? '',
    website: draft?.website ?? '',
  })

  useEffect(() => {
    if (result?.status === 'invalid') {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
  }, [result])

  // Free the local preview when it is replaced or the form closes.
  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview.url)
    },
    [logoPreview],
  )

  const fieldErrors = result?.status === 'invalid' ? result.fieldErrors : {}
  const fieldId = (field: SponsorFormField) => `${id}-${field}`
  const errorFor = (field: SponsorFormField) => {
    const code = fieldErrors[field]
    return code ? t(`errors.${code}`) : undefined
  }
  const update =
    <K extends keyof typeof preview>(field: K) =>
    (value: (typeof preview)[K]) => {
      setPreview((current) => ({ ...current, [field]: value }))
    }

  const logo = logoPreview ?? draft?.logo ?? null
  const previewSponsor: Sponsor = {
    id: draft?.id ?? 0,
    name: preview.name || t('preview.name'),
    logo: logo && { ...logo, alt: '' },
    tier: preview.tier,
    since: Number(preview.since) || new Date().getFullYear(),
    description:
      (locale === 'de' ? preview.descriptionDe : preview.descriptionEn) || t('preview.description'),
    website: preview.website || null,
    announcementHref: null,
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      if (logoFile) {
        formData.set('logo', await resizeImage(logoFile, LOGO_MAX_EDGE))
      }
      const saved = await save(formData)
      if (saved.status === 'saved') {
        onSaved(saved.sponsor, preview.name.trim())
        return
      }
      setResult(saved)
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
      {result?.status === 'invalid' && <Alert>{t('errors.summary')}</Alert>}
      {result?.status === 'error' && <Alert>{t('errors.server')}</Alert>}
      {result?.status === 'unauthorized' && (
        <Alert>
          {t('errors.unauthorized')}{' '}
          <Link href={loginHref} className="underline underline-offset-4">
            {t('errors.signIn')}
          </Link>
        </Alert>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-text-muted">{t('preview.label')}</p>
        {/* A picture of the card, not part of the form: no focus, not read out twice. */}
        <div inert>
          <SponsorCard sponsor={previewSponsor} />
        </div>
      </div>

      {draft && <input type="hidden" name="id" value={draft.id} />}

      <FormField
        id={fieldId('logo')}
        label={t('form.logo')}
        hint={t('form.logoHint')}
        error={errorFor('logo')}
      >
        {(control) => (
          <LogoDropZone
            control={control}
            previewUrl={logo?.url ?? null}
            chooseLabel={t('form.chooseLogo')}
            changeLabel={t('form.changeLogo')}
            dropLabel={t('form.dropLogo')}
            onChoose={(file) => {
              setLogoFile(file)
              void measureImage(file).then((size) => {
                setLogoPreview({ url: URL.createObjectURL(file), ...size })
              })
            }}
          />
        )}
      </FormField>

      <FormField id={fieldId('name')} label={t('form.name')} error={errorFor('name')}>
        {(control) => (
          <input
            {...control}
            name="name"
            required
            autoComplete="organization"
            maxLength={NAME_MAX_LENGTH}
            value={preview.name}
            onChange={(event) => {
              update('name')(event.target.value)
            }}
            className={formControlClassName}
          />
        )}
      </FormField>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t('form.tier')}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {SPONSOR_TIERS.map((tier) => {
            const Icon = TIER_ICONS[tier]
            return (
              <label
                key={tier}
                className={cn(
                  'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-150',
                  'has-checked:border-brand-primary has-checked:bg-surface-highlight has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus-ring',
                  'border-border-default hover:border-text-muted',
                )}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier}
                  checked={preview.tier === tier}
                  onChange={() => {
                    update('tier')(tier)
                  }}
                  className="sr-only"
                />
                <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-primary" />
                <span>
                  <span className="block font-semibold">{t(`form.tiers.${tier}.label`)}</span>
                  <span className="block text-sm text-text-muted">
                    {t(`form.tiers.${tier}.hint`)}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-aside-content">
        <FormField id={fieldId('since')} label={t('form.since')} error={errorFor('since')}>
          {(control) => (
            <input
              {...control}
              name="since"
              type="number"
              inputMode="numeric"
              required
              min={FIRST_SPONSOR_YEAR}
              max={LAST_SPONSOR_YEAR}
              value={preview.since}
              onChange={(event) => {
                update('since')(event.target.value)
              }}
              className={cn(formControlClassName, 'tabular-nums')}
            />
          )}
        </FormField>
        <FormField
          id={fieldId('website')}
          label={t('form.website')}
          optionalLabel={t('form.optional')}
          error={errorFor('website')}
        >
          {(control) => (
            <input
              {...control}
              name="website"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://"
              value={preview.website}
              onChange={(event) => {
                update('website')(event.target.value)
              }}
              className={formControlClassName}
            />
          )}
        </FormField>
      </div>

      {(['descriptionEn', 'descriptionDe'] as const).map((field) => (
        <FormField
          key={field}
          id={fieldId(field)}
          label={t(`form.${field}`)}
          hint={t('form.descriptionHint', { max: DESCRIPTION_MAX_LENGTH })}
          error={errorFor(field)}
        >
          {(control) => (
            <textarea
              {...control}
              name={field}
              required
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              lang={field === 'descriptionDe' ? 'de' : 'en'}
              value={preview[field]}
              onChange={(event) => {
                update(field)(event.target.value)
              }}
              className={formControlClassName}
            />
          )}
        </FormField>
      ))}

      <label className="flex min-h-11 items-start gap-3 py-1">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={draft?.isActive ?? true}
          className="mt-0.5 size-5 shrink-0 accent-brand-primary"
        />
        <span className="font-medium">
          {t('form.isActive')}
          <span className="block text-sm font-normal text-text-muted">
            {t('form.isActiveHint')}
          </span>
        </span>
      </label>

      <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-border-default bg-surface-default px-6 py-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          {t('form.cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? t('form.saving') : t('form.save')}
        </Button>
      </div>
    </form>
  )
}
