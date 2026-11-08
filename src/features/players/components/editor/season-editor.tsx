'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { RetryAlert, SignInRequiredAlert } from '@/shared/ui/alert'

import type { EditorResult, PlayerEditing, SeasonEditorData } from '../../editor-types'
import { SeasonForm } from './season-form'

/** What the season editor was asked to do. */
export type SeasonEditorIntent =
  | { kind: 'add' }
  | { kind: 'edit'; id: number }
  /** `label` names the season in the dialog, e.g. "2026 · Club". */
  | { kind: 'delete'; id: number; label: string }

export type SeasonEditorProps = {
  intent: SeasonEditorIntent
  playerId: number
  editing: PlayerEditing
  onClose: () => void
  /** Called with a confirmation once the page shows the change. */
  onDone: (message: string) => void
}

type LoadState = { status: 'loading' } | EditorResult<SeasonEditorData>

function FormSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

function EditSeasonSheet({
  seasonId,
  playerId,
  editing,
  onClose,
  onDone,
}: { seasonId: number | null } & Omit<SeasonEditorProps, 'intent'>) {
  const t = useTranslations('players.seasonEditor')
  const { refreshThen, isFinishing } = useRefreshThen()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const { getSeasonEditorData } = editing.actions

  const load = useCallback(() => {
    setState({ status: 'loading' })
    void getSeasonEditorData(playerId, seasonId).then(setState)
  }, [getSeasonEditorData, playerId, seasonId])

  useEffect(() => {
    let isCurrent = true
    void getSeasonEditorData(playerId, seasonId).then((result) => {
      if (isCurrent) setState(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getSeasonEditorData, playerId, seasonId])

  return (
    <Sheet
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={seasonId === null ? t('sheet.addTitle') : t('sheet.editTitle')}
      description={t('sheet.description')}
      closeLabel={t('sheet.close')}
      size="wide"
    >
      {state.status === 'loading' && <FormSkeleton label={t('sheet.loading')} />}
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
        <SeasonForm
          playerId={playerId}
          draft={state.data.draft}
          teams={state.data.teams}
          loginHref={editing.loginHref}
          save={editing.actions.saveSeason}
          onCancel={onClose}
          isFinishing={isFinishing}
          onSaved={(season) => {
            refreshThen(() => {
              onDone(t('saved', { season }))
            })
          }}
        />
      )}
    </Sheet>
  )
}

function DeleteSeasonDialog({
  id,
  label,
  editing,
  onClose,
  onDone,
}: { id: number; label: string } & Omit<SeasonEditorProps, 'intent' | 'playerId'>) {
  const t = useTranslations('players.seasonEditor')
  const { refreshThen, isFinishing } = useRefreshThen()
  const [isDeleting, startTransition] = useTransition()
  const isPending = isDeleting || isFinishing
  const [error, setError] = useState<string | undefined>()

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={t('deleteDialog.title', { season: label })}
      description={t('deleteDialog.description')}
      confirmLabel={isPending ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
      cancelLabel={t('deleteDialog.cancel')}
      isPending={isPending}
      error={error}
      onConfirm={() => {
        startTransition(async () => {
          const result = await editing.actions.deleteSeason(id)
          if (result.status === 'deleted') {
            refreshThen(() => {
              onDone(t('deleted', { season: label }))
            })
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

/** The side panel for adding or editing a season record, or the dialog for deleting one. */
export function SeasonEditor({ intent, ...props }: SeasonEditorProps) {
  if (intent.kind === 'delete') {
    return <DeleteSeasonDialog id={intent.id} label={intent.label} {...props} />
  }
  return <EditSeasonSheet seasonId={intent.kind === 'edit' ? intent.id : null} {...props} />
}
