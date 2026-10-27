import { PencilLine, Trash2 } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

export type EditActionsProps = {
  /** Accessible names, e.g. "Edit Saqib Rafiq": the buttons show icons only. */
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
  className?: string
}

const BUTTON_CLASS =
  'inline-flex size-9 items-center justify-center rounded-full bg-surface-default/90 text-text-default shadow-md backdrop-blur-sm transition-colors duration-150 hover:bg-surface-default [&_svg]:size-4'

/**
 * Edit and delete buttons for editors, placed over a card or header. They sit above a card's
 * full-size link (z-10), so they stay clickable and keep their own focus outline.
 */
export function EditActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  className,
}: EditActionsProps) {
  return (
    <div className={cn('z-10 flex gap-1.5', className)}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        title={editLabel}
        className={BUTTON_CLASS}
      >
        <PencilLine aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={deleteLabel}
        title={deleteLabel}
        className={cn(BUTTON_CLASS, 'text-status-danger-text')}
      >
        <Trash2 aria-hidden="true" />
      </button>
    </div>
  )
}
