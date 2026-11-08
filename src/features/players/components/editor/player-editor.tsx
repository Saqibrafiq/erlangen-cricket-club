'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { useEditorLoad } from '@/shared/lib/use-editor-load'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { DeleteConfirmDialog } from '@/shared/ui/delete-confirm-dialog'
import { EditorLoadView } from '@/shared/ui/editor-load-view'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'

import type { PlayerEditing } from '../../editor-types'
import { PlayerForm, type SavedPlayer } from './player-form'

/** What the editor was asked to do. */
export type EditorIntent =
  { kind: 'add' } | { kind: 'edit'; id: number } | { kind: 'delete'; id: number; name: string }

export type PlayerEditorProps = {
  intent: EditorIntent
  editing: PlayerEditing
  onClose: () => void
  /** Called after the page has been refreshed with the change. */
  onSaved: (player: SavedPlayer, name: string) => void
  /** Called after the page has been refreshed without the player. */
  onDeleted: (name: string) => void
  /** Plays the item's delete effect; deleting waits for it before refreshing the page. */
  vanish?: (id: number) => Promise<void>
}

type EditPlayerSheetProps = {
  id: number | null
  editing: PlayerEditing
  onClose: () => void
  onSaved: (player: SavedPlayer, name: string) => void
  /** True while the page is fetched again after the save; the form stays busy meanwhile. */
  isFinishing: boolean
}

function FormSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <Skeleton className="size-24 rounded-2xl" />
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

/** Loads the player (or team list for a new one) and shows the form in a side panel. */
function EditPlayerSheet({ id, editing, onClose, onSaved, isFinishing }: EditPlayerSheetProps) {
  const t = useTranslations('players.editor')
  const locale = useLocale()
  const { getEditorData } = editing.actions
  const loadPlayer = useCallback(() => getEditorData(id, locale), [getEditorData, id, locale])
  const { state, reload } = useEditorLoad(loadPlayer)

  return (
    <Sheet
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={id === null ? t('sheet.addTitle') : t('sheet.editTitle')}
      description={t('sheet.description')}
      closeLabel={t('sheet.close')}
    >
      <EditorLoadView
        state={state}
        skeleton={<FormSkeleton label={t('sheet.loading')} />}
        loadError={t('errors.load')}
        signInHref={editing.loginHref}
        onRetry={reload}
      >
        {(data) => (
          <PlayerForm
            draft={data.draft}
            teams={data.teams}
            locale={locale}
            loginHref={editing.loginHref}
            save={editing.actions.savePlayer}
            onSaved={onSaved}
            onCancel={onClose}
            isFinishing={isFinishing}
          />
        )}
      </EditorLoadView>
    </Sheet>
  )
}

/** The side panel for adding or editing a player, or the dialog for deleting one. */
export function PlayerEditor({
  intent,
  editing,
  onClose,
  onSaved,
  onDeleted,
  vanish,
}: PlayerEditorProps) {
  const t = useTranslations('players.editor')
  const { refreshThen, isFinishing } = useRefreshThen()

  if (intent.kind === 'delete') {
    const { id, name } = intent
    return (
      <DeleteConfirmDialog
        title={t('deleteDialog.title', { name })}
        description={t('deleteDialog.description')}
        onDelete={() => editing.actions.deletePlayer(id)}
        vanish={vanish && (() => vanish(id))}
        onDeleted={() => {
          refreshThen(() => {
            onDeleted(name)
          })
        }}
        onClose={onClose}
        isFinishing={isFinishing}
      />
    )
  }
  return (
    <EditPlayerSheet
      id={intent.kind === 'edit' ? intent.id : null}
      editing={editing}
      onClose={onClose}
      onSaved={(player, name) => {
        refreshThen(() => {
          onSaved(player, name)
        })
      }}
      isFinishing={isFinishing}
    />
  )
}
