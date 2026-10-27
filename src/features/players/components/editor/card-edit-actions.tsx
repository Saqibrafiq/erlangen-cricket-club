'use client'

import { useTranslations } from 'next-intl'

import { EditActions } from '@/shared/ui/edit-actions'

export type CardEditActionsProps = {
  name: string
  onEdit: () => void
  onDelete: () => void
  className?: string
}

/** Edit and delete buttons over a player card or profile, named for the player. */
export function CardEditActions({ name, onEdit, onDelete, className }: CardEditActionsProps) {
  const t = useTranslations('players.editor')

  return (
    <EditActions
      editLabel={t('edit', { name })}
      deleteLabel={t('delete', { name })}
      onEdit={onEdit}
      onDelete={onDelete}
      className={className}
    />
  )
}
