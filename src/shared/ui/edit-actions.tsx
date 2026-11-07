import { cva, type VariantProps } from 'class-variance-authority'
import { PencilLine, Trash2 } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

const buttonVariants = cva(
  'inline-flex size-9 items-center justify-center rounded-full transition-colors duration-150 [&_svg]:size-4',
  {
    variants: {
      variant: {
        /** Floating over a photo (player and news cards). */
        overlay:
          'bg-surface-default/90 text-text-default shadow-md backdrop-blur-sm hover:bg-surface-default',
        /** In a card's own row (fixture cards): quiet until hovered. */
        inline: 'text-text-muted hover:bg-surface-muted hover:text-text-default',
      },
    },
    defaultVariants: { variant: 'overlay' },
  },
)

export type EditActionsProps = VariantProps<typeof buttonVariants> & {
  /** Accessible names, e.g. "Edit Saqib Rafiq": the buttons show icons only. */
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
  className?: string
}

/**
 * Edit and delete buttons for editors, placed over a card or header. They sit above a card's
 * full-size link (z-10), so they stay clickable and keep their own focus outline.
 */
export function EditActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  variant,
  className,
}: EditActionsProps) {
  return (
    <div
      className={cn('z-10 flex shrink-0', variant === 'inline' ? 'gap-0.5' : 'gap-1.5', className)}
    >
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        title={editLabel}
        className={buttonVariants({ variant })}
      >
        <PencilLine aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={deleteLabel}
        title={deleteLabel}
        className={cn(buttonVariants({ variant }), 'text-status-danger-text')}
      >
        <Trash2 aria-hidden="true" />
      </button>
    </div>
  )
}
