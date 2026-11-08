'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback } from 'react'

import { useEditorLoad } from '@/shared/lib/use-editor-load'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { DeleteConfirmDialog } from '@/shared/ui/delete-confirm-dialog'
import { EditorLoadView } from '@/shared/ui/editor-load-view'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'

import type { SponsorDraft, SponsorEditing, SponsorEditorResult } from '../../editor-types'
import { type SavedSponsor, SponsorForm } from './sponsor-form'

/** What the editor was asked to do. */
export type SponsorIntent =
  { kind: 'add' } | { kind: 'edit'; id: number } | { kind: 'delete'; id: number; name: string }

export type SponsorEditorProps = {
  intent: SponsorIntent
  editing: SponsorEditing
  onClose: () => void
  /** Called after the page has been refreshed with the change. */
  onSaved: (sponsor: SavedSponsor, name: string) => void
  /** Called after the page has been refreshed without the sponsor. */
  onDeleted: (name: string) => void
  /** Plays the card's delete effect; deleting waits for it before refreshing the page. */
  vanish?: (id: number) => Promise<void>
}

type EditSponsorSheetProps = {
  id: number | null
  editing: SponsorEditing
  onClose: () => void
  onSaved: (sponsor: SavedSponsor, name: string) => void
  /** True while the page is fetched again after the save; the form stays busy meanwhile. */
  isFinishing: boolean
}

/** A new sponsor has nothing to load: the empty form shows at once. */
const NEW_SPONSOR = { status: 'ok', data: null } as const

function FormSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <Skeleton className="h-56 w-full rounded-3xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  )
}

/** Loads the sponsor (nothing to load for a new one) and shows the form in a side panel. */
function EditSponsorSheet({ id, editing, onClose, onSaved, isFinishing }: EditSponsorSheetProps) {
  const t = useTranslations('sponsors.editor')
  const locale = useLocale()
  const { getSponsor } = editing.actions
  const loadSponsor = useCallback(
    (): Promise<SponsorEditorResult<SponsorDraft | null>> =>
      id === null ? Promise.resolve(NEW_SPONSOR) : getSponsor(id),
    [getSponsor, id],
  )
  const { state, reload } = useEditorLoad(loadSponsor, id === null ? NEW_SPONSOR : undefined)

  return (
    <Sheet
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={id === null ? t('sheet.addTitle') : t('sheet.editTitle')}
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
        {(draft) => (
          <SponsorForm
            draft={draft}
            locale={locale}
            loginHref={editing.loginHref}
            save={editing.actions.saveSponsor}
            onSaved={onSaved}
            onCancel={onClose}
            isFinishing={isFinishing}
          />
        )}
      </EditorLoadView>
    </Sheet>
  )
}

/** The side panel for adding or editing a sponsor, or the dialog for deleting one. */
export function SponsorEditor({
  intent,
  editing,
  onClose,
  onSaved,
  onDeleted,
  vanish,
}: SponsorEditorProps) {
  const t = useTranslations('sponsors.editor')
  const { refreshThen, isFinishing } = useRefreshThen()

  if (intent.kind === 'delete') {
    const { id, name } = intent
    return (
      <DeleteConfirmDialog
        title={t('deleteDialog.title', { name })}
        description={t('deleteDialog.description')}
        onDelete={() => editing.actions.deleteSponsor(id)}
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
    <EditSponsorSheet
      id={intent.kind === 'edit' ? intent.id : null}
      editing={editing}
      onClose={onClose}
      onSaved={(sponsor, name) => {
        refreshThen(() => {
          onSaved(sponsor, name)
        })
      }}
      isFinishing={isFinishing}
    />
  )
}
