'use client'

import { useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { useEditorLoad } from '@/shared/lib/use-editor-load'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { DeleteConfirmDialog } from '@/shared/ui/delete-confirm-dialog'
import { EditorLoadView } from '@/shared/ui/editor-load-view'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'

import type { PlayerEditing } from '../../editor-types'
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
  const { getSeasonEditorData } = editing.actions
  const loadSeason = useCallback(
    () => getSeasonEditorData(playerId, seasonId),
    [getSeasonEditorData, playerId, seasonId],
  )
  const { state, reload } = useEditorLoad(loadSeason)

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
      <EditorLoadView
        state={state}
        skeleton={<FormSkeleton label={t('sheet.loading')} />}
        loadError={t('errors.load')}
        signInHref={editing.loginHref}
        onRetry={reload}
      >
        {(data) => (
          <SeasonForm
            playerId={playerId}
            draft={data.draft}
            teams={data.teams}
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
      </EditorLoadView>
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

  return (
    <DeleteConfirmDialog
      title={t('deleteDialog.title', { season: label })}
      description={t('deleteDialog.description')}
      confirmLabel={t('deleteDialog.confirm')}
      errorMessage={t('deleteDialog.error')}
      onDelete={() => editing.actions.deleteSeason(id)}
      onDeleted={() => {
        refreshThen(() => {
          onDone(t('deleted', { season: label }))
        })
      }}
      onClose={onClose}
      isFinishing={isFinishing}
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
