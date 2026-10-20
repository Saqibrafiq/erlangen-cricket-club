'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { EditorToolbar } from '@/shared/ui/editor-toolbar'

import type { EditorResult, HiddenPlayer, PlayerEditorActions } from '../../editor-types'

export type SquadToolbarProps = {
  getHiddenPlayers: PlayerEditorActions['getHiddenPlayers']
  /** Changes after every save or delete, so the hidden list is fetched again. */
  refreshKey: number
  onAdd: () => void
  onEdit: (id: number) => void
}

/**
 * Editors' controls above the squad: add a player, and reach the players who are hidden from
 * visitors because no consent is recorded yet.
 */
export function SquadToolbar({ getHiddenPlayers, refreshKey, onAdd, onEdit }: SquadToolbarProps) {
  const t = useTranslations('players.editor')
  const [hidden, setHidden] = useState<EditorResult<HiddenPlayer[]> | null>(null)

  useEffect(() => {
    let isCurrent = true
    void getHiddenPlayers().then((result) => {
      if (isCurrent) setHidden(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getHiddenPlayers, refreshKey])

  const hiddenPlayers = hidden?.status === 'ok' ? hidden.data : []

  return (
    <EditorToolbar
      addLabel={t('add')}
      onAdd={onAdd}
      error={hidden?.status === 'error' ? t('errors.hiddenLoad') : undefined}
      hidden={{
        summary: t('hidden.summary', { count: hiddenPlayers.length }),
        hint: t('hidden.hint'),
        items: hiddenPlayers.map((player) => ({ id: player.id, label: player.name })),
        editLabel: (item) => t('edit', { name: item.label }),
        onEdit,
      }}
    />
  )
}
