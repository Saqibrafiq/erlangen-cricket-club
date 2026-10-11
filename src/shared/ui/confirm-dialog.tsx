'use client'

import { AlertDialog } from 'radix-ui'

import { Button } from './button'

export type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  /** While the action runs: the confirm button shows it and both buttons wait. */
  isPending?: boolean
  /** Shown above the buttons when the action failed, so the person can retry or cancel. */
  error?: string
}

/**
 * Asks before something that cannot be undone, such as deleting a player. Focus starts on Cancel
 * (the safe choice); Escape cancels. The dialog stays open until `onOpenChange(false)`, so the
 * caller closes it once the action succeeded.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isPending = false,
  error,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-media-overlay/60 backdrop-blur-sm motion-safe:animate-fade-in" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface-default p-6 shadow-xl motion-safe:animate-fade-in">
          <AlertDialog.Title className="text-xl font-bold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-text-muted">
            {description}
          </AlertDialog.Description>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
            >
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" disabled={isPending}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            {/* Not AlertDialog.Action: that would close the dialog before the action finished. */}
            <Button variant="danger" onClick={onConfirm} disabled={isPending} aria-busy={isPending}>
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
