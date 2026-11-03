'use client'

import { FileUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { type ReactNode, useState } from 'react'

import { useIsEditMode } from '@/shared/lib/edit-mode'
import { EditorToolbar } from '@/shared/ui/editor-toolbar'

import type { FixtureEditing } from '../../editor-types'

// The importer loads only once an editor opens it; visitors never download it.
const FixturesImporter = dynamic(
  () => import('./fixtures-importer').then((module) => module.FixturesImporter),
  { ssr: false },
)

export type FixturesEditingProviderProps = {
  /** Import actions; nothing changes for visitors, with or without them. */
  editing?: FixtureEditing
  children: ReactNode
}

/**
 * Edit mode for fixtures: in an editor's browser it adds the "Import fixtures" toolbar, a notice
 * and the importer. For visitors it renders only its children, the static fixtures.
 */
export function FixturesEditingProvider({ editing, children }: FixturesEditingProviderProps) {
  const t = useTranslations('fixtures.import')
  const isEditMode = useIsEditMode()
  const [isOpen, setIsOpen] = useState(false)
  const [notice, setNotice] = useState('')

  if (!isEditMode || !editing) {
    return children
  }

  return (
    <>
      <div className="space-y-6">
        <EditorToolbar
          addLabel={t('open')}
          addIcon={FileUp}
          onAdd={() => {
            setIsOpen(true)
          }}
        />
        <p role="status" className="text-sm font-medium text-brand-primary empty:hidden">
          {notice}
        </p>
        {children}
      </div>
      {isOpen && (
        <FixturesImporter
          editing={editing}
          onClose={() => {
            setIsOpen(false)
          }}
          onImported={({ competition, created, updated, removed, teamsAdded, groundsAdded }) => {
            setIsOpen(false)
            setNotice(
              t('notice', {
                competition: `${competition.name} ${competition.season}`,
                created,
                updated,
                removed,
                added: teamsAdded + groundsAdded,
              }),
            )
          }}
        />
      )}
    </>
  )
}
