'use client'

import { useTranslations } from 'next-intl'
import { type SubmitEvent, useCallback, useEffect, useId, useState, useTransition } from 'react'

import { cn } from '@/shared/lib/cn'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { FormField, formControlClassName } from '@/shared/ui/form-field'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { Alert, RetryAlert, SignInRequiredAlert } from '@/shared/ui/alert'

import {
  EDITABLE_STAGES,
  EDITABLE_STATUSES,
  type FixtureFormField,
} from '../../domain/fixture-form'
import type {
  FixtureEditing,
  FixtureEditorData,
  FixtureEditorResult,
  SaveFixtureResult,
} from '../../editor-types'

/** What the editor was asked to do. */
export type FixtureIntent =
  { kind: 'edit'; id: number } | { kind: 'delete'; id: number; title: string }

export type FixtureEditorProps = {
  intent: FixtureIntent
  editing: FixtureEditing
  onClose: () => void
  /** Called once the page has been refreshed with the change. */
  onSaved: (title: string) => void
  /** Called once the page has been refreshed without the fixture. */
  onDeleted: (title: string) => void
  /** Plays the card's delete effect; deleting waits for it before refreshing the page. */
  vanish?: (id: number) => Promise<void>
}

type LoadState = { status: 'loading' } | FixtureEditorResult<FixtureEditorData>
type FinishingProps = { isFinishing: boolean }

type FixtureFormProps = {
  data: FixtureEditorData
  loginHref: string
  save: FixtureEditing['actions']['saveFixture']
  onSaved: () => void
  onCancel: () => void
  isFinishing: boolean
}

/** Date, time, ground and stage; for a match not yet played also whether it goes ahead. */
function FixtureForm({ data, loginHref, save, onSaved, onCancel, isFinishing }: FixtureFormProps) {
  const t = useTranslations('fixtures.editor')
  const tStage = useTranslations('fixtures.stage')
  const id = useId()
  const [result, setResult] = useState<SaveFixtureResult | null>(null)
  const [isSaving, startTransition] = useTransition()
  const isPending = isSaving || isFinishing
  const { draft, grounds } = data
  const isPlayed = draft.status === 'completed'
  const fieldErrors = result?.status === 'invalid' ? result.fieldErrors : {}
  const fieldId = (field: FixtureFormField) => `${id}-${field}`
  const errorFor = (field: FixtureFormField) => {
    const code = fieldErrors[field]
    return code ? t(`errors.${code}`) : undefined
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const saved = await save(formData)
      if (saved.status === 'saved') {
        onSaved()
        return
      }
      setResult(saved)
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {result?.status === 'invalid' && <Alert>{t('errors.summary')}</Alert>}
      {result?.status === 'error' && <Alert>{t('errors.server')}</Alert>}
      {result?.status === 'unauthorized' && (
        <SignInRequiredAlert
          message={t('errors.unauthorized')}
          signInLabel={t('errors.signIn')}
          signInHref={loginHref}
        />
      )}
      <input type="hidden" name="id" value={draft.id} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={fieldId('day')} label={t('day')} error={errorFor('day')}>
          {(control) => (
            <input
              {...control}
              name="day"
              type="date"
              required
              defaultValue={draft.day}
              className={cn(formControlClassName, 'tabular-nums')}
            />
          )}
        </FormField>
        <FormField
          id={fieldId('startTime')}
          label={t('startTime')}
          optionalLabel={t('optional')}
          error={errorFor('startTime')}
        >
          {(control) => (
            <input
              {...control}
              name="startTime"
              type="time"
              defaultValue={draft.startTime ?? ''}
              className={cn(formControlClassName, 'tabular-nums')}
            />
          )}
        </FormField>
      </div>

      <FormField
        id={fieldId('ground')}
        label={t('ground')}
        hint={t('groundHint')}
        error={errorFor('ground')}
      >
        {(control) => (
          <select
            {...control}
            name="ground"
            defaultValue={draft.groundId === null ? '' : String(draft.groundId)}
            className={formControlClassName}
          >
            <option value="">{t('noGround')}</option>
            {grounds.map((ground) => (
              <option key={ground.id} value={ground.id}>
                {ground.name}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={fieldId('stage')} label={t('stage')} error={errorFor('stage')}>
          {(control) => (
            <select
              {...control}
              name="stage"
              defaultValue={draft.stage}
              className={formControlClassName}
            >
              {EDITABLE_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {tStage(stage)}
                </option>
              ))}
            </select>
          )}
        </FormField>
        {isPlayed ? (
          <p className="self-end text-sm text-text-muted">{t('playedHint')}</p>
        ) : (
          <FormField id={fieldId('status')} label={t('status')} error={errorFor('status')}>
            {(control) => (
              <select
                {...control}
                name="status"
                defaultValue={draft.status}
                className={formControlClassName}
              >
                {EDITABLE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`statuses.${status}`)}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}
      </div>

      <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-border-default bg-surface-default px-6 py-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  )
}

function FormSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  )
}

function EditFixtureSheet({
  id,
  editing,
  onClose,
  onSaved,
  isFinishing,
}: { id: number } & Omit<FixtureEditorProps, 'intent' | 'onDeleted' | 'vanish' | 'onSaved'> & {
    onSaved: (title: string) => void
  } & FinishingProps) {
  const t = useTranslations('fixtures.editor')
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const { getFixture } = editing.actions

  const load = useCallback(() => {
    setState({ status: 'loading' })
    void getFixture(id).then(setState)
  }, [getFixture, id])

  useEffect(() => {
    let isCurrent = true
    void getFixture(id).then((result) => {
      if (isCurrent) setState(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getFixture, id])

  return (
    <Sheet
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={
        state.status === 'ok' ? t('title', { match: state.data.draft.title }) : t('loadingTitle')
      }
      description={t('description')}
      closeLabel={t('close')}
    >
      {state.status === 'loading' && <FormSkeleton label={t('loading')} />}
      {state.status === 'unauthorized' && (
        <SignInRequiredAlert
          message={t('errors.unauthorized')}
          signInLabel={t('errors.signIn')}
          signInHref={editing.loginHref}
        />
      )}
      {state.status === 'error' && (
        <RetryAlert message={t('errors.load')} retryLabel={t('errors.retry')} onRetry={load} />
      )}
      {state.status === 'ok' && (
        <FixtureForm
          data={state.data}
          loginHref={editing.loginHref}
          save={editing.actions.saveFixture}
          onSaved={() => {
            onSaved(state.data.draft.title)
          }}
          onCancel={onClose}
          isFinishing={isFinishing}
        />
      )}
    </Sheet>
  )
}

/** Asks before deleting; stays open with an error if it fails. */
function DeleteFixtureDialog({
  id,
  title,
  editing,
  onClose,
  onDeleted,
  vanish,
  isFinishing,
}: { id: number; title: string } & Omit<FixtureEditorProps, 'intent' | 'onSaved'> &
  FinishingProps) {
  const t = useTranslations('fixtures.editor')
  const [isDeleting, startTransition] = useTransition()
  const isPending = isDeleting || isFinishing
  const [error, setError] = useState<string | undefined>()
  // Closed while the card vanishes, so the dialog doesn't hide the effect.
  const [isHidden, setIsHidden] = useState(false)

  return (
    <ConfirmDialog
      open={!isHidden}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={t('deleteDialog.title', { match: title })}
      description={t('deleteDialog.description')}
      confirmLabel={isPending ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
      cancelLabel={t('deleteDialog.cancel')}
      isPending={isPending}
      error={error}
      onConfirm={() => {
        startTransition(async () => {
          const result = await editing.actions.deleteFixture(id)
          if (result.status === 'deleted') {
            setIsHidden(true)
            await vanish?.(id)
            onDeleted(title)
            return
          }
          setError(
            result.status === 'unauthorized' ? t('errors.unauthorized') : t('deleteDialog.error'),
          )
        })
      }}
    />
  )
}

/** The side panel for editing a fixture, or the dialog for deleting one. */
export function FixtureEditor({
  intent,
  onSaved,
  onDeleted,
  vanish,
  ...props
}: FixtureEditorProps) {
  const { refreshThen, isFinishing } = useRefreshThen()

  if (intent.kind === 'delete') {
    return (
      <DeleteFixtureDialog
        id={intent.id}
        title={intent.title}
        isFinishing={isFinishing}
        vanish={vanish}
        onDeleted={(title) => {
          refreshThen(() => {
            onDeleted(title)
          })
        }}
        {...props}
      />
    )
  }
  return (
    <EditFixtureSheet
      id={intent.id}
      isFinishing={isFinishing}
      onSaved={(title) => {
        refreshThen(() => {
          onSaved(title)
        })
      }}
      {...props}
    />
  )
}
