'use client'

import { FileUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { createContext, type ReactNode, use, useState } from 'react'

import { useIsEditMode } from '@/shared/lib/edit-mode'
import { useVanishing } from '@/shared/lib/use-vanishing'
import { EditActions } from '@/shared/ui/edit-actions'
import { EditorToolbar } from '@/shared/ui/editor-toolbar'
import { Vanish } from '@/shared/ui/vanish'

import type { FixtureEditing } from '../../editor-types'
import type { FixtureIntent } from './fixture-editor'

// Editing code loads only once an editor opens it; visitors never download it.
const FixturesImporter = dynamic(
  () => import('./fixtures-importer').then((module) => module.FixturesImporter),
  { ssr: false },
)
const FixtureEditor = dynamic(
  () => import('./fixture-editor').then((module) => module.FixtureEditor),
  { ssr: false },
)

type FixturesEditingContextValue = {
  open: (intent: FixtureIntent) => void
  vanishingId: number | null
  onVanished: () => void
}

const FixturesEditingContext = createContext<FixturesEditingContextValue | null>(null)

/** The import panel, or one fixture's editor. */
type EditingIntent = { kind: 'import' } | FixtureIntent

export type FixturesEditingProviderProps = {
  /** Editing actions; nothing changes for visitors, with or without them. */
  editing?: FixtureEditing
  /** Show the "Import fixtures" toolbar (the fixtures pages); a competition page edits only. */
  canImport?: boolean
  children: ReactNode
}

/**
 * Edit mode for fixtures: in an editor's browser it adds the import toolbar, a notice and the
 * editor that each fixture's edit and delete buttons open. For visitors it renders only its
 * children, the static fixtures.
 */
export function FixturesEditingProvider({
  editing,
  canImport = true,
  children,
}: FixturesEditingProviderProps) {
  const t = useTranslations('fixtures')
  const isEditMode = useIsEditMode()
  const [intent, setIntent] = useState<EditingIntent | null>(null)
  const [notice, setNotice] = useState('')
  const { vanishingId, vanish, finish: onVanished } = useVanishing()

  if (!isEditMode || !editing) {
    return children
  }

  const finish = (message: string) => {
    setIntent(null)
    setNotice(message)
  }

  return (
    <FixturesEditingContext value={{ open: setIntent, vanishingId, onVanished }}>
      <div className="space-y-6">
        {canImport && (
          <EditorToolbar
            addLabel={t('import.open')}
            addIcon={FileUp}
            onAdd={() => {
              setIntent({ kind: 'import' })
            }}
          />
        )}
        <p role="status" className="text-sm font-medium text-brand-primary empty:hidden">
          {notice}
        </p>
        {children}
      </div>
      {intent?.kind === 'import' && (
        <FixturesImporter
          editing={editing}
          onClose={() => {
            setIntent(null)
          }}
          onImported={({ competition, created, updated, removed, teamsAdded, groundsAdded }) => {
            finish(
              t('import.notice', {
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
      {intent && intent.kind !== 'import' && (
        <FixtureEditor
          intent={intent}
          editing={editing}
          vanish={vanish}
          onClose={() => {
            setIntent(null)
          }}
          onSaved={(title) => {
            finish(t('editor.notice.saved', { match: title }))
          }}
          onDeleted={(title) => {
            finish(t('editor.notice.deleted', { match: title }))
          }}
        />
      )}
    </FixturesEditingContext>
  )
}

export type FixtureEditActionsProps = {
  id: number
  /** "ECC-I v NCC-I": names the buttons and the delete dialog. */
  title: string
}

/**
 * Lets a fixture card dissolve when it is deleted; just the card outside edit mode. Keeps the
 * card's subgrid, so cards in a row still line up.
 */
export function FixtureVanish({ id, children }: { id: number; children: ReactNode }) {
  const context = use(FixturesEditingContext)
  if (!context) {
    return children
  }

  return (
    <Vanish
      isVanishing={context.vanishingId === id}
      onVanished={context.onVanished}
      className="row-span-4 grid grid-rows-subgrid"
    >
      {children}
    </Vanish>
  )
}

/** Edit and delete buttons for the card's bottom row; nothing outside edit mode. */
export function FixtureEditActions({ id, title }: FixtureEditActionsProps) {
  const t = useTranslations('fixtures.editor')
  const context = use(FixturesEditingContext)
  if (!context) {
    return null
  }

  return (
    <EditActions
      variant="inline"
      editLabel={t('edit', { match: title })}
      deleteLabel={t('delete', { match: title })}
      onEdit={() => {
        context.open({ kind: 'edit', id })
      }}
      onDelete={() => {
        context.open({ kind: 'delete', id, title })
      }}
      className="-my-2 -mr-2"
    />
  )
}
