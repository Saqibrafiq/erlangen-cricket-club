'use client'

import { FileUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { createContext, type ReactNode, use, useState } from 'react'

import { useIsEditMode } from '@/shared/lib/edit-mode'
import { Button } from '@/shared/ui/button'
import { EditorToolbar } from '@/shared/ui/editor-toolbar'

import type { StandingsEditing } from '../../editor-types'

// The importer loads only once an editor opens it; visitors never download it.
const StandingsImporter = dynamic(
  () => import('./standings-importer').then((module) => module.StandingsImporter),
  { ssr: false },
)

type StandingsEditingContextValue = { open: (competitionId: number | null) => void }

const StandingsEditingContext = createContext<StandingsEditingContextValue | null>(null)

/** Which importer is open: for a given competition, or one the editor picks. */
type ImporterIntent = { competitionId: number | null }

export type StandingsEditingProviderProps = {
  /** Import actions; nothing changes for visitors, with or without them. */
  editing?: StandingsEditing
  children: ReactNode
}

/**
 * Edit mode for standings: in an editor's browser it adds the "Import table" toolbar, a notice
 * and the importer that each table's "Update" button opens. For visitors it renders only its
 * children, the static tables.
 */
export function StandingsEditingProvider({ editing, children }: StandingsEditingProviderProps) {
  const t = useTranslations('standings.import')
  const isEditMode = useIsEditMode()
  const [intent, setIntent] = useState<ImporterIntent | null>(null)
  const [notice, setNotice] = useState('')

  if (!isEditMode || !editing) {
    return children
  }

  const open = (competitionId: number | null) => {
    setIntent({ competitionId })
  }

  return (
    <StandingsEditingContext value={{ open }}>
      <div className="space-y-6">
        <EditorToolbar
          addLabel={t('open')}
          addIcon={FileUp}
          onAdd={() => {
            open(null)
          }}
        />
        <p role="status" className="text-sm font-medium text-brand-primary empty:hidden">
          {notice}
        </p>
        {children}
      </div>
      {intent && (
        <StandingsImporter
          editing={editing}
          competitionId={intent.competitionId}
          onClose={() => {
            setIntent(null)
          }}
          onImported={({ competition, teamCount, teamsAdded }) => {
            setIntent(null)
            setNotice(
              t(teamsAdded > 0 ? 'notice.importedWithTeams' : 'notice.imported', {
                competition: `${competition.name} ${competition.season}`,
                count: teamCount,
                added: teamsAdded,
              }),
            )
          }}
        />
      )}
    </StandingsEditingContext>
  )
}

export type StandingsUpdateButtonProps = {
  competitionId: number
  /** Names the table for assistive technology, e.g. "BCV Regionalliga Bayern 2026". */
  competitionName: string
}

/** Opens the importer for one table; nothing outside edit mode. */
export function StandingsUpdateButton({
  competitionId,
  competitionName,
}: StandingsUpdateButtonProps) {
  const t = useTranslations('standings.import')
  const context = use(StandingsEditingContext)
  if (!context) {
    return null
  }

  return (
    <Button
      variant="secondary"
      onClick={() => {
        context.open(competitionId)
      }}
    >
      <FileUp aria-hidden="true" />
      {t('update')} <span className="sr-only">{competitionName}</span>
    </Button>
  )
}
