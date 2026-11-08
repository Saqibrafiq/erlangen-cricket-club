'use client'

import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'

import { ConfirmDialog } from './confirm-dialog'

export type DeleteResult = { status: 'deleted' } | { status: 'unauthorized' } | { status: 'error' }

export type DeleteConfirmDialogProps = {
  title: string
  description: string
  /** "Delete" by default. */
  confirmLabel?: string
  /** "Could not delete. Please try again." by default. */
  errorMessage?: string
  onDelete: () => Promise<DeleteResult>
  /** Plays the item's delete effect; the dialog closes meanwhile so it doesn't hide the effect. */
  vanish?: () => Promise<void>
  /** After a successful delete (and the effect). */
  onDeleted: () => void
  onClose: () => void
  /** True while the page is fetched again after the delete; the dialog stays busy meanwhile. */
  isFinishing?: boolean
}

/**
 * Asks before deleting something from the website. A failure keeps the dialog open with the
 * reason, so the editor can retry or cancel.
 */
export function DeleteConfirmDialog({
  title,
  description,
  confirmLabel,
  errorMessage,
  onDelete,
  vanish,
  onDeleted,
  onClose,
  isFinishing = false,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('deleteDialog')
  const [isDeleting, startTransition] = useTransition()
  const isPending = isDeleting || isFinishing
  const [error, setError] = useState<string | undefined>()
  const [isHidden, setIsHidden] = useState(false)

  return (
    <ConfirmDialog
      open={!isHidden}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={title}
      description={description}
      confirmLabel={isPending ? t('deleting') : (confirmLabel ?? t('confirm'))}
      cancelLabel={t('cancel')}
      isPending={isPending}
      error={error}
      onConfirm={() => {
        startTransition(async () => {
          const result = await onDelete()
          if (result.status === 'deleted') {
            if (vanish) {
              setIsHidden(true)
              await vanish()
            }
            onDeleted()
            return
          }
          setError(
            result.status === 'unauthorized' ? t('sessionEnded') : (errorMessage ?? t('error')),
          )
        })
      }}
    />
  )
}
