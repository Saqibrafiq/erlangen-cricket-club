'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { useRouter } from '@/i18n/navigation'
import { useIsEditMode } from '@/shared/lib/edit-mode'

import type { PlayerEditing } from '../../editor-types'
import { getPlayerPath } from '../../paths'
import type { EditorIntent } from './player-editor'

// Editing code loads only in an editor's browser; visitors never download it.
const CardEditActions = dynamic(
  () => import('./card-edit-actions').then((module) => module.CardEditActions),
  { ssr: false },
)
const PlayerEditor = dynamic(
  () => import('./player-editor').then((module) => module.PlayerEditor),
  {
    ssr: false,
  },
)

export type ProfileEditActionsProps = {
  player: { id: number; name: string; slug: string }
  editing: PlayerEditing
  playersHref: string
}

/**
 * Edit and delete on a player's profile, for editors. Afterwards the page follows the change: a
 * renamed player moves to the new address; a deleted or now hidden player leads back to the squad.
 */
export function ProfileEditActions({ player, editing, playersHref }: ProfileEditActionsProps) {
  const isEditMode = useIsEditMode()
  const router = useRouter()
  const [intent, setIntent] = useState<EditorIntent | null>(null)

  if (!isEditMode) {
    return null
  }

  return (
    <>
      <CardEditActions
        name={player.name}
        className="absolute top-4 left-4"
        onEdit={() => {
          setIntent({ kind: 'edit', id: player.id })
        }}
        onDelete={() => {
          setIntent({ kind: 'delete', id: player.id, name: player.name })
        }}
      />
      {intent && (
        <PlayerEditor
          intent={intent}
          editing={editing}
          onClose={() => {
            setIntent(null)
          }}
          onSaved={(saved) => {
            setIntent(null)
            if (!saved.isPublic) {
              router.push(playersHref)
            } else if (saved.slug !== player.slug) {
              router.replace(getPlayerPath(saved.slug))
            }
          }}
          onDeleted={() => {
            router.push(playersHref)
          }}
        />
      )}
    </>
  )
}
