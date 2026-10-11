'use client'

import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'

import type { EditorResult, PlayerEditing, PlayerEditorData } from '../../editor-types'
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
}

type LoadState = { status: 'loading' } | EditorResult<PlayerEditorData>

/** True while the page is fetched again after a change; the form or dialog stays busy meanwhile. */
type FinishingProps = { isFinishing: boolean }

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
function EditPlayerSheet({
  id,
  editing,
  onClose,
  onSaved,
  isFinishing,
}: { id: number | null } & Omit<PlayerEditorProps, 'intent' | 'onDeleted'> & FinishingProps) {
  const t = useTranslations('players.editor')
  const locale = useLocale()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const { getEditorData } = editing.actions

  const load = useCallback(() => {
    setState({ status: 'loading' })
    void getEditorData(id, locale).then(setState)
  }, [getEditorData, id, locale])

  useEffect(() => {
    let isCurrent = true
    void getEditorData(id, locale).then((result) => {
      if (isCurrent) setState(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getEditorData, id, locale])

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
      {state.status === 'loading' && <FormSkeleton label={t('sheet.loading')} />}
      {state.status === 'unauthorized' && (
        <p role="alert" className="space-x-1">
          <span>{t('errors.unauthorized')}</span>
          <Link href={editing.loginHref} className="font-medium underline underline-offset-4">
            {t('errors.signIn')}
          </Link>
        </p>
      )}
      {state.status === 'error' && (
        <div role="alert" className="space-y-3">
          <p>{t('errors.load')}</p>
          <Button variant="secondary" onClick={load}>
            {t('errors.retry')}
          </Button>
        </div>
      )}
      {state.status === 'ok' && (
        <PlayerForm
          draft={state.data.draft}
          teams={state.data.teams}
          locale={locale}
          loginHref={editing.loginHref}
          save={editing.actions.savePlayer}
          onSaved={onSaved}
          onCancel={onClose}
          isFinishing={isFinishing}
        />
      )}
    </Sheet>
  )
}

/** Asks before deleting; stays open with an error if it fails. */
function DeletePlayerDialog({
  id,
  name,
  editing,
  onClose,
  onDeleted,
  isFinishing,
}: { id: number; name: string } & Omit<PlayerEditorProps, 'intent' | 'onSaved'> & FinishingProps) {
  const t = useTranslations('players.editor')
  const [isDeleting, startTransition] = useTransition()
  const isPending = isDeleting || isFinishing
  const [error, setError] = useState<string | undefined>()

  return (
    <ConfirmDialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={t('deleteDialog.title', { name })}
      description={t('deleteDialog.description')}
      confirmLabel={isPending ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
      cancelLabel={t('deleteDialog.cancel')}
      isPending={isPending}
      error={error}
      onConfirm={() => {
        startTransition(async () => {
          const result = await editing.actions.deletePlayer(id)
          if (result.status === 'deleted') {
            onDeleted(name)
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

/** The side panel for adding or editing a player, or the dialog for deleting one. */
export function PlayerEditor({ intent, onSaved, onDeleted, ...props }: PlayerEditorProps) {
  const router = useRouter()
  const [isRefreshing, startRefresh] = useTransition()
  const [whenRefreshed, setWhenRefreshed] = useState<(() => void) | null>(null)

  // Report the change only once the refreshed page is on screen, so the list never lags behind.
  useEffect(() => {
    if (whenRefreshed && !isRefreshing) {
      whenRefreshed()
    }
  }, [whenRefreshed, isRefreshing])

  const refreshThen = (callback: () => void) => {
    setWhenRefreshed(() => callback)
    startRefresh(() => {
      router.refresh()
    })
  }
  const isFinishing = whenRefreshed !== null

  if (intent.kind === 'delete') {
    return (
      <DeletePlayerDialog
        id={intent.id}
        name={intent.name}
        isFinishing={isFinishing}
        onDeleted={(name) => {
          refreshThen(() => {
            onDeleted(name)
          })
        }}
        {...props}
      />
    )
  }
  return (
    <EditPlayerSheet
      id={intent.kind === 'edit' ? intent.id : null}
      isFinishing={isFinishing}
      onSaved={(player, name) => {
        refreshThen(() => {
          onSaved(player, name)
        })
      }}
      {...props}
    />
  )
}
