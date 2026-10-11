'use client'

import { PencilLine, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/shared/lib/cn'

export type CardEditActionsProps = {
  name: string
  onEdit: () => void
  onDelete: () => void
  className?: string
}

const BUTTON_CLASS =
  'inline-flex size-9 items-center justify-center rounded-full bg-surface-default/90 text-text-default shadow-md backdrop-blur-sm transition-colors duration-150 hover:bg-surface-default [&_svg]:size-4'

/**
 * Edit and delete buttons over a player card or profile. They sit above the card's full-size link
 * (z-10), so they stay clickable and keep their own focus outline.
 */
export function CardEditActions({ name, onEdit, onDelete, className }: CardEditActionsProps) {
  const t = useTranslations('players.editor')

  return (
    <div className={cn('z-10 flex gap-1.5', className)}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={t('edit', { name })}
        className={BUTTON_CLASS}
      >
        <PencilLine aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t('delete', { name })}
        className={cn(BUTTON_CLASS, 'text-status-danger-text')}
      >
        <Trash2 aria-hidden="true" />
      </button>
    </div>
  )
}
