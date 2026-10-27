'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { createContext, type ReactNode, use, useEffect, useState } from 'react'

import { useIsEditMode } from '@/shared/lib/edit-mode'
import { useVanishing } from '@/shared/lib/use-vanishing'
import { EditActions } from '@/shared/ui/edit-actions'
import { EditorToolbar } from '@/shared/ui/editor-toolbar'
import { Vanish } from '@/shared/ui/vanish'

import type { InactiveSponsor, SponsorEditing, SponsorEditorResult } from '../../editor-types'
import type { SponsorIntent } from './sponsor-editor'

// The editor loads only once an editor opens it; visitors never download it.
const SponsorEditor = dynamic(
  () => import('./sponsor-editor').then((module) => module.SponsorEditor),
  { ssr: false },
)

type SponsorEditingContextValue = {
  open: (intent: SponsorIntent) => void
  vanishingId: number | null
  onVanished: () => void
}

const SponsorEditingContext = createContext<SponsorEditingContextValue | null>(null)

export type SponsorEditingProviderProps = {
  /** Editing actions; nothing changes for visitors, with or without them. */
  editing?: SponsorEditing
  children: ReactNode
}

function InactiveToolbar({
  getInactiveSponsors,
  refreshKey,
  open,
}: {
  getInactiveSponsors: SponsorEditing['actions']['getInactiveSponsors']
  refreshKey: number
  open: SponsorEditingContextValue['open']
}) {
  const t = useTranslations('sponsors.editor')
  const [inactive, setInactive] = useState<SponsorEditorResult<InactiveSponsor[]> | null>(null)

  useEffect(() => {
    let isCurrent = true
    void getInactiveSponsors().then((result) => {
      if (isCurrent) setInactive(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getInactiveSponsors, refreshKey])

  const items = inactive?.status === 'ok' ? inactive.data : []

  return (
    <EditorToolbar
      addLabel={t('add')}
      onAdd={() => {
        open({ kind: 'add' })
      }}
      error={inactive?.status === 'error' ? t('errors.inactiveLoad') : undefined}
      hidden={{
        summary: t('inactive.summary', { count: items.length }),
        hint: t('inactive.hint'),
        items: items.map((sponsor) => ({ id: sponsor.id, label: sponsor.name })),
        editLabel: (item) => t('edit', { name: item.label }),
        onEdit: (id) => {
          open({ kind: 'edit', id })
        },
      }}
    />
  )
}

/**
 * Edit mode for sponsors: in an editor's browser it adds the toolbar (add, past sponsors), a
 * notice and one shared editor that the cards' edit and delete buttons open. For visitors it
 * renders only its children, the static sponsor list.
 */
export function SponsorEditingProvider({ editing, children }: SponsorEditingProviderProps) {
  const t = useTranslations('sponsors.editor')
  const isEditMode = useIsEditMode()
  const [intent, setIntent] = useState<SponsorIntent | null>(null)
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const { vanishingId, vanish, finish: onVanished } = useVanishing()

  if (!isEditMode || !editing) {
    return children
  }

  const finish = (message: string) => {
    setIntent(null)
    setNotice(message)
    setRefreshKey((key) => key + 1)
  }

  return (
    <SponsorEditingContext value={{ open: setIntent, vanishingId, onVanished }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <InactiveToolbar
          getInactiveSponsors={editing.actions.getInactiveSponsors}
          refreshKey={refreshKey}
          open={setIntent}
        />
        <p role="status" className="text-sm font-medium text-brand-primary empty:hidden">
          {notice}
        </p>
        {children}
      </div>
      {intent && (
        <SponsorEditor
          intent={intent}
          editing={editing}
          vanish={vanish}
          onClose={() => {
            setIntent(null)
          }}
          onSaved={(sponsor, name) => {
            finish(t(sponsor.isActive ? 'notice.saved' : 'notice.savedInactive', { name }))
          }}
          onDeleted={(name) => {
            finish(t('notice.deleted', { name }))
          }}
        />
      )}
    </SponsorEditingContext>
  )
}

export type SponsorVanishProps = { id: number; children: ReactNode }

/** Lets a sponsor card dissolve when it is deleted; just the card outside edit mode. */
export function SponsorVanish({ id, children }: SponsorVanishProps) {
  const context = use(SponsorEditingContext)
  if (!context) {
    return children
  }

  return (
    <Vanish isVanishing={context.vanishingId === id} onVanished={context.onVanished}>
      {children}
    </Vanish>
  )
}

export type SponsorEditActionsProps = {
  id: number
  name: string
  className?: string
}

/** Edit and delete buttons for one sponsor; nothing outside edit mode. */
export function SponsorEditActions({ id, name, className }: SponsorEditActionsProps) {
  const t = useTranslations('sponsors.editor')
  const context = use(SponsorEditingContext)
  if (!context) {
    return null
  }

  return (
    <EditActions
      editLabel={t('edit', { name })}
      deleteLabel={t('delete', { name })}
      onEdit={() => {
        context.open({ kind: 'edit', id })
      }}
      onDelete={() => {
        context.open({ kind: 'delete', id, name })
      }}
      className={className}
    />
  )
}
