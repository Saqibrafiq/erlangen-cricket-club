'use client'

import { EyeOff, PencilLine, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Button } from '@/shared/ui/button'

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
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-brand-primary/40 bg-surface-highlight p-4 sm:flex-row sm:items-start sm:justify-between">
      <Button onClick={onAdd}>
        <Plus aria-hidden="true" />
        {t('add')}
      </Button>
      {hidden?.status === 'error' && (
        <p className="text-sm text-status-danger-text">{t('errors.hiddenLoad')}</p>
      )}
      {hiddenPlayers.length > 0 && (
        <details className="group sm:max-w-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 font-medium">
            <EyeOff aria-hidden="true" className="size-4" />
            {t('hidden.summary', { count: hiddenPlayers.length })}
          </summary>
          <p className="mt-1 px-2 text-sm text-text-muted">{t('hidden.hint')}</p>
          <ul className="mt-2">
            {hiddenPlayers.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => {
                    onEdit(player.id)
                  }}
                  className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-2 text-left hover:bg-surface-muted"
                >
                  <span>{player.name}</span>
                  <PencilLine aria-hidden="true" className="size-4 shrink-0" />
                  <span className="sr-only">{t('edit', { name: player.name })}</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
