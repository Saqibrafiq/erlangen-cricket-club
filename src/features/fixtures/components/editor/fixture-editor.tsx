'use client'

import { useTranslations } from 'next-intl'
import { type SubmitEvent, useCallback, useId, useState, useTransition } from 'react'

import { cn } from '@/shared/lib/cn'
import { useEditorLoad } from '@/shared/lib/use-editor-load'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { Button } from '@/shared/ui/button'
import { DeleteConfirmDialog } from '@/shared/ui/delete-confirm-dialog'
import { EditorLoadView } from '@/shared/ui/editor-load-view'
import { FormField, formControlClassName } from '@/shared/ui/form-field'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { Alert, SignInRequiredAlert } from '@/shared/ui/alert'

import {
  EDITABLE_STAGES,
  EDITABLE_STATUSES,
  type FixtureFormField,
} from '../../domain/fixture-form'
import type { FixtureEditing, FixtureEditorData, SaveFixtureResult } from '../../editor-types'

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
      {result?.status === 'unauthorized' && <SignInRequiredAlert signInHref={loginHref} />}
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

type EditFixtureSheetProps = {
  id: number
  editing: FixtureEditing
  onClose: () => void
  onSaved: (title: string) => void
  /** True while the page is fetched again after the save; the form stays busy meanwhile. */
  isFinishing: boolean
}

function EditFixtureSheet({ id, editing, onClose, onSaved, isFinishing }: EditFixtureSheetProps) {
  const t = useTranslations('fixtures.editor')
  const { getFixture } = editing.actions
  const loadFixture = useCallback(() => getFixture(id), [getFixture, id])
  const { state, reload } = useEditorLoad(loadFixture)

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
      <EditorLoadView
        state={state}
        skeleton={<FormSkeleton label={t('loading')} />}
        loadError={t('errors.load')}
        signInHref={editing.loginHref}
        onRetry={reload}
      >
        {(data) => (
          <FixtureForm
            data={data}
            loginHref={editing.loginHref}
            save={editing.actions.saveFixture}
            onSaved={() => {
              onSaved(data.draft.title)
            }}
            onCancel={onClose}
            isFinishing={isFinishing}
          />
        )}
      </EditorLoadView>
    </Sheet>
  )
}

/** The side panel for editing a fixture, or the dialog for deleting one. */
export function FixtureEditor({
  intent,
  editing,
  onClose,
  onSaved,
  onDeleted,
  vanish,
}: FixtureEditorProps) {
  const t = useTranslations('fixtures.editor')
  const { refreshThen, isFinishing } = useRefreshThen()

  if (intent.kind === 'delete') {
    const { id, title } = intent
    return (
      <DeleteConfirmDialog
        title={t('deleteDialog.title', { match: title })}
        description={t('deleteDialog.description')}
        onDelete={() => editing.actions.deleteFixture(id)}
        vanish={vanish && (() => vanish(id))}
        onDeleted={() => {
          refreshThen(() => {
            onDeleted(title)
          })
        }}
        onClose={onClose}
        isFinishing={isFinishing}
      />
    )
  }
  return (
    <EditFixtureSheet
      id={intent.id}
      editing={editing}
      onClose={onClose}
      onSaved={(title) => {
        refreshThen(() => {
          onSaved(title)
        })
      }}
      isFinishing={isFinishing}
    />
  )
}
