'use client'

import { ImageUp, Images, LoaderCircle, X } from 'lucide-react'
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
import { TIME_ZONE } from '@/i18n/routing'
import { IMAGE_UPLOAD_TYPES } from '@/shared/config/image-upload'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { FormField, formControlClassName } from '@/shared/ui/form-field'
import { RichTextEditor, type RichTextValue } from '@/shared/ui/rich-text-editor'

import {
  EXCERPT_MAX_LENGTH,
  IMAGE_STYLES,
  type NewsFormField,
  TITLE_MAX_LENGTH,
} from '../../domain/news-form'
import { isEditableOnWebsite, toEditorDocument } from '../../domain/rich-text'
import type { NewsDraft, NewsEditorActions, SaveNewsResult } from '../../editor-types'
import type { NewsImageStyle } from '../../types'
import { useArticleImages } from './use-article-images'

export type SavedArticle = Extract<SaveNewsResult, { status: 'saved' }>['article']

export type NewsFormProps = {
  /** The article to edit, or `null` to write a new one. */
  draft: NewsDraft | null
  locale: string
  loginHref: string
  actions: Pick<NewsEditorActions, 'saveArticle' | 'uploadImage'>
  onSaved: (article: SavedArticle, title: string) => void
  onCancel: () => void
  /** Saved, and the page is being refreshed: the form stays busy until it closes. */
  isFinishing?: boolean
}

const IMAGE_ACCEPT = IMAGE_UPLOAD_TYPES.join(',')
const PICKER_CLASS =
  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border-default px-4 font-medium transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:bg-surface-muted [&_svg]:size-4'

/** Today in the club's time zone as `YYYY-MM-DD` (en-CA formats dates that way). */
function getToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date())
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
 * Writes or edits an article: title, summary, main image (photo or logo), the text in a visual
 * editor, a photo gallery and the date; then publish, save as draft or unpublish. Images upload as
 * they are chosen; the server validates everything again on save.
 */
export function NewsForm({
  draft,
  locale,
  loginHref,
  actions,
  onSaved,
  onCancel,
  isFinishing = false,
}: NewsFormProps) {
  const t = useTranslations('news.editor')
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<SaveNewsResult | null>(null)
  const [isSaving, startTransition] = useTransition()
  const isPending = isSaving || isFinishing
  const isTextEditable = draft === null || isEditableOnWebsite(draft.body)
  const [body, setBody] = useState<RichTextValue | null>(
    draft && isTextEditable ? toEditorDocument(draft.body) : null,
  )
  const images = useArticleImages({
    initialFeatured: draft?.featuredImage ?? null,
    initialGallery: draft?.gallery ?? [],
    upload: actions.uploadImage,
    locale,
    getAlt: () => titleRef.current?.value.trim() ?? '',
  })
  const isPublished = draft?.status === 'published'

  useEffect(() => {
    if (result?.status === 'invalid') {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    }
  }, [result])

  const fieldErrors = result?.status === 'invalid' ? result.fieldErrors : {}
  const fieldId = (field: NewsFormField) => `${id}-${field}`
  const errorFor = (field: NewsFormField) => {
    const code = fieldErrors[field]
    return code ? t(`errors.${code}`) : undefined
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    // The pressed button (publish, draft…) sends the status.
    const formData = new FormData(event.currentTarget, event.nativeEvent.submitter)
    if (isTextEditable) {
      formData.set('body', JSON.stringify(body ?? {}))
    }
    startTransition(async () => {
      const saved = await actions.saveArticle(formData)
      if (saved.status === 'saved') {
        const title = formData.get('title')
        onSaved(saved.article, typeof title === 'string' ? title.trim() : '')
        return
      }
      setResult(saved)
    })
  }

  const isBusy = isPending || images.isUploading

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
      {result?.status === 'invalid' && <Alert>{t('errors.summary')}</Alert>}
      {result?.status === 'error' && <Alert>{t('errors.server')}</Alert>}
      {(result?.status === 'unauthorized' || images.error === 'unauthorized') && (
        <Alert>
          {t('errors.unauthorized')}{' '}
          <Link href={loginHref} className="underline underline-offset-4">
            {t('errors.signIn')}
          </Link>
        </Alert>
      )}

      <p className="rounded-lg bg-surface-highlight p-3 text-sm">
        {draft
          ? t('sheet.editLanguage', {
              language: t(`languages.${locale === 'de' ? 'de' : 'en'}`),
            })
          : t('sheet.newLanguages')}
        {draft?.status === 'draft' && (
          <span className="mt-1 block font-semibold">{t('sheet.draftStatus')}</span>
        )}
      </p>

      {draft && <input type="hidden" name="id" value={draft.id} />}
      <input type="hidden" name="locale" value={locale} />
      {images.featured && <input type="hidden" name="featuredImage" value={images.featured.id} />}
      {images.gallery.map((image) => (
        <input key={image.id} type="hidden" name="gallery" value={image.id} />
      ))}

      <FormField id={fieldId('title')} label={t('form.title')} error={errorFor('title')}>
        {(control) => (
          <input
            {...control}
            ref={titleRef}
            name="title"
            required
            maxLength={TITLE_MAX_LENGTH}
            defaultValue={draft?.title}
            className={cn(formControlClassName, 'text-lg font-semibold')}
          />
        )}
      </FormField>

      <FormField
        id={fieldId('excerpt')}
        label={t('form.excerpt')}
        hint={t('form.excerptHint', { max: EXCERPT_MAX_LENGTH })}
        error={errorFor('excerpt')}
      >
        {(control) => (
          <textarea
            {...control}
            name="excerpt"
            rows={2}
            required
            maxLength={EXCERPT_MAX_LENGTH}
            defaultValue={draft?.excerpt}
            className={formControlClassName}
          />
        )}
      </FormField>

      <FormField
        id={fieldId('featuredImage')}
        label={t('form.mainImage')}
        hint={t('form.mainImageHint')}
        error={errorFor('featuredImage')}
      >
        {(control) => (
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex aspect-video w-48 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
              {images.featured ? (
                // A stored image from our media library; not worth next/image in the editor.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images.featured.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImageUp aria-hidden="true" className="size-8 text-text-muted" />
              )}
            </div>
            <div className="space-y-2">
              <input
                {...control}
                type="file"
                accept={IMAGE_ACCEPT}
                disabled={isBusy}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ''
                  if (file) void images.chooseFeatured(file)
                }}
                className="peer sr-only"
              />
              <label htmlFor={control.id} className={PICKER_CLASS}>
                <ImageUp aria-hidden="true" />
                {images.featured ? t('form.changeImage') : t('form.chooseImage')}
              </label>
              {images.featured ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    images.removeFeatured()
                  }}
                  disabled={isBusy}
                >
                  {t('form.removeImage')}
                </Button>
              ) : (
                <p className="text-sm text-text-muted">{t('form.noImage')}</p>
              )}
              <fieldset className="pt-1">
                <legend className="text-sm font-medium">{t('form.imageStyle')}</legend>
                {IMAGE_STYLES.map((style: NewsImageStyle) => (
                  <label key={style} className="flex min-h-9 items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="featuredImageStyle"
                      value={style}
                      defaultChecked={(draft?.featuredImageStyle ?? 'photo') === style}
                      className="size-4 accent-brand-primary"
                    />
                    {t(style === 'logo' ? 'form.styleLogo' : 'form.stylePhoto')}
                  </label>
                ))}
              </fieldset>
            </div>
          </div>
        )}
      </FormField>

      {isTextEditable ? (
        <FormField id={fieldId('body')} label={t('form.text')} error={errorFor('body')}>
          {(control) => (
            <RichTextEditor
              id={control.id}
              labelId={`${control.id}-label`}
              initialValue={body}
              onChange={setBody}
              aria-describedby={control['aria-describedby']}
              aria-invalid={control['aria-invalid']}
            />
          )}
        </FormField>
      ) : (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">{t('form.text')}</p>
          <p className="rounded-lg border border-dashed border-border-default p-3 text-sm text-text-muted">
            {t('form.readOnlyText')}
          </p>
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">{t('form.gallery')}</legend>
        <p className="text-sm text-text-muted">{t('form.galleryHint')}</p>
        {images.gallery.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.gallery.map((image, index) => (
              <li key={image.id} className="relative aspect-square overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element -- editor thumbnail */}
                <img src={image.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    images.removeFromGallery(image.id)
                  }}
                  disabled={isBusy}
                  aria-label={t('form.removePhoto', { number: index + 1 })}
                  className="absolute top-1 right-1 inline-flex size-8 items-center justify-center rounded-full bg-surface-default/90 shadow-md hover:bg-surface-default"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div>
          <input
            id={`${id}-gallery`}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            disabled={isBusy}
            onChange={(event) => {
              const files = [...(event.target.files ?? [])]
              event.target.value = ''
              if (files.length > 0) void images.addToGallery(files)
            }}
            className="peer sr-only"
          />
          <label htmlFor={`${id}-gallery`} className={PICKER_CLASS}>
            <Images aria-hidden="true" />
            {t('form.addPhotos')}
          </label>
        </div>
      </fieldset>

      <p role="status" className="-mt-3 text-sm empty:hidden">
        {images.progress && (
          <span className="inline-flex items-center gap-2 text-text-muted">
            <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
            {t('form.uploading', images.progress)}
          </span>
        )}
        {images.error && images.error !== 'unauthorized' && (
          <span className="text-status-danger-text">{t(`errors.${images.error}`)}</span>
        )}
      </p>

      <FormField id={fieldId('publishedAt')} label={t('form.date')} error={errorFor('publishedAt')}>
        {(control) => (
          <input
            {...control}
            type="date"
            name="publishedAt"
            required
            defaultValue={draft?.publishedAt ?? getToday()}
            className={cn(formControlClassName, 'w-auto')}
          />
        )}
      </FormField>

      <div className="sticky bottom-0 -mx-6 flex flex-wrap gap-3 border-t border-border-default bg-surface-default px-6 py-4">
        <Button
          type="submit"
          name="status"
          value="published"
          disabled={isBusy}
          aria-busy={isPending}
        >
          {isPending ? t('form.saving') : isPublished ? t('form.update') : t('form.publish')}
        </Button>
        <Button type="submit" name="status" value="draft" variant="secondary" disabled={isBusy}>
          {isPublished ? t('form.unpublish') : t('form.saveDraft')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
          {t('form.cancel')}
        </Button>
      </div>
    </form>
  )
}
