'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useState, useTransition } from 'react'

import { Link } from '@/i18n/navigation'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
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

type LoadState = { status: 'loading' } | SponsorEditorResult<SponsorDraft | null>

/** True while the page is fetched again after a change; the form or dialog stays busy meanwhile. */
type FinishingProps = { isFinishing: boolean }

const NEW_SPONSOR: LoadState = { status: 'ok', data: null }

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
function EditSponsorSheet({
  id,
  editing,
  onClose,
  onSaved,
  isFinishing,
}: { id: number | null } & Omit<SponsorEditorProps, 'intent' | 'onDeleted' | 'vanish'> &
  FinishingProps) {
  const t = useTranslations('sponsors.editor')
  const locale = useLocale()
  const [state, setState] = useState<LoadState>(id === null ? NEW_SPONSOR : { status: 'loading' })
  const { getSponsor } = editing.actions

  const load = useCallback(() => {
    if (id === null) return
    setState({ status: 'loading' })
    void getSponsor(id).then(setState)
  }, [getSponsor, id])

  useEffect(() => {
    if (id === null) return
    let isCurrent = true
    void getSponsor(id).then((result) => {
      if (isCurrent) setState(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getSponsor, id])

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
        <SponsorForm
          draft={state.data}
          locale={locale}
          loginHref={editing.loginHref}
          save={editing.actions.saveSponsor}
          onSaved={onSaved}
          onCancel={onClose}
          isFinishing={isFinishing}
        />
      )}
    </Sheet>
  )
}

/** Asks before deleting; stays open with an error if it fails. */
function DeleteSponsorDialog({
  id,
  name,
  editing,
  onClose,
  onDeleted,
  vanish,
  isFinishing,
}: { id: number; name: string } & Omit<SponsorEditorProps, 'intent' | 'onSaved'> & FinishingProps) {
  const t = useTranslations('sponsors.editor')
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
      title={t('deleteDialog.title', { name })}
      description={t('deleteDialog.description')}
      confirmLabel={isPending ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
      cancelLabel={t('deleteDialog.cancel')}
      isPending={isPending}
      error={error}
      onConfirm={() => {
        startTransition(async () => {
          const result = await editing.actions.deleteSponsor(id)
          if (result.status === 'deleted') {
            setIsHidden(true)
            await vanish?.(id)
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

/** The side panel for adding or editing a sponsor, or the dialog for deleting one. */
export function SponsorEditor({
  intent,
  onSaved,
  onDeleted,
  vanish,
  ...props
}: SponsorEditorProps) {
  const { refreshThen, isFinishing } = useRefreshThen()

  if (intent.kind === 'delete') {
    return (
      <DeleteSponsorDialog
        id={intent.id}
        name={intent.name}
        isFinishing={isFinishing}
        vanish={vanish}
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
    <EditSponsorSheet
      id={intent.kind === 'edit' ? intent.id : null}
      isFinishing={isFinishing}
      onSaved={(sponsor, name) => {
        refreshThen(() => {
          onSaved(sponsor, name)
        })
      }}
      {...props}
    />
  )
}
