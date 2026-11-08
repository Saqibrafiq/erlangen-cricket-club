'use client'

import { LoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type SubmitEvent, useId, useState, useTransition } from 'react'

import {
  CompetitionTargetFields,
  getInitialTarget,
  getTargetTitle,
  NEW_COMPETITION,
} from '@/features/competitions'
import { useEditorLoad } from '@/shared/lib/use-editor-load'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { Button } from '@/shared/ui/button'
import { CsvFileField } from '@/shared/ui/csv-file-field'
import { EditorLoadView } from '@/shared/ui/editor-load-view'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { Alert, SignInRequiredAlert } from '@/shared/ui/alert'

import { parseStandingsCsv, type StandingsCsvResult } from '../../domain/standings-csv'
import { diffStandings } from '../../domain/standings-diff'
import type {
  ImportStandingsResult,
  StandingsEditing,
  StandingsImportData,
} from '../../editor-types'
import {
  StandingsCsvErrors,
  StandingsImportPreview,
  toPreviewRows,
} from './standings-import-preview'

export type ImportedTable = Extract<ImportStandingsResult, { status: 'imported' }>

export type StandingsImporterProps = {
  editing: StandingsEditing
  /** The competition to update, or `null` to let the editor pick (or start a new season). */
  competitionId: number | null
  onClose: () => void
  /** Called once the page has been refreshed with the new table. */
  onImported: (result: ImportedTable) => void
}

type CsvFile = { name: string; result: StandingsCsvResult }

function ImporterSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-5">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

type ImportFormProps = {
  data: StandingsImportData
  competitionId: number | null
  loginHref: string
  importStandings: StandingsEditing['actions']['importStandings']
  onImported: (result: ImportedTable) => void
  onCancel: () => void
  isFinishing: boolean
}

function ImportForm({
  data,
  competitionId,
  loginHref,
  importStandings,
  onImported,
  onCancel,
  isFinishing,
}: ImportFormProps) {
  const t = useTranslations('standings.import')
  const id = useId()
  const [target, setTarget] = useState(() => getInitialTarget(data.competitions, competitionId))
  const [csv, setCsv] = useState<(CsvFile & { text: string }) | null>(null)
  const [result, setResult] = useState<ImportStandingsResult | null>(null)
  const [isImporting, startTransition] = useTransition()
  const isPending = isImporting || isFinishing

  const competition =
    target.target === NEW_COMPETITION
      ? undefined
      : data.competitions.find((candidate) => String(candidate.id) === target.target)
  const caption = getTargetTitle(data.competitions, target, t('newCompetitionPlaceholder'))
  const knownTeams = new Set(data.teams.map((team) => team.shortName))
  const parsed = csv?.result
  const diff = parsed?.success
    ? diffStandings(competition?.rows ?? [], parsed.rows, knownTeams)
    : null

  async function chooseFile(file: File) {
    const text = await file.text()
    setResult(null)
    setCsv({ name: file.name, text, result: parseStandingsCsv(text) })
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!csv) return
    const formData = new FormData(event.currentTarget)
    formData.set('csv', csv.text)
    startTransition(async () => {
      const imported = await importStandings(formData)
      if (imported.status === 'imported') {
        onImported(imported)
        return
      }
      setResult(imported)
    })
  }

  const canImport = Boolean(diff && !diff.isUnchanged) && !isPending

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {result?.status === 'error' && <Alert>{t('errors.server')}</Alert>}
      {result?.status === 'unauthorized' && <SignInRequiredAlert signInHref={loginHref} />}
      {result?.status === 'invalidFile' && <StandingsCsvErrors errors={result.errors} />}

      <CompetitionTargetFields
        competitions={data.competitions}
        alwaysIncludeId={competitionId}
        value={target}
        onChange={setTarget}
        fieldErrors={result?.status === 'invalid' ? result.fieldErrors : undefined}
      />

      <CsvFileField
        id={`${id}-file`}
        label={t('file')}
        hint={t('fileHint')}
        fileName={csv?.name}
        onFile={(file) => void chooseFile(file)}
      />

      {parsed && !parsed.success && <StandingsCsvErrors errors={parsed.errors} />}
      {parsed?.success && diff && (
        <StandingsImportPreview
          diff={diff}
          rows={toPreviewRows(parsed.rows, data.teams)}
          caption={caption}
        />
      )}

      <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-border-default bg-surface-default px-6 py-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!canImport}>
          {isPending && <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />}
          {isPending
            ? t('importing')
            : t('confirm', { count: parsed?.success ? parsed.rows.length : 0 })}
        </Button>
      </div>
    </form>
  )
}

/**
 * Updates a league table from CricClubs' points table export: pick the competition (or start a
 * new season), drop the file, check what changes, confirm. Nothing is saved before that.
 */
export function StandingsImporter({
  editing,
  competitionId,
  onClose,
  onImported,
}: StandingsImporterProps) {
  const t = useTranslations('standings.import')
  const { refreshThen, isFinishing } = useRefreshThen()
  const { state, reload } = useEditorLoad(editing.actions.getImportData)

  return (
    <Sheet
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      title={t('title')}
      description={t('description')}
      closeLabel={t('close')}
      size="wide"
    >
      <EditorLoadView
        state={state}
        skeleton={<ImporterSkeleton label={t('loading')} />}
        loadError={t('errors.load')}
        signInHref={editing.loginHref}
        onRetry={reload}
      >
        {(data) => (
          <ImportForm
            data={data}
            competitionId={competitionId}
            loginHref={editing.loginHref}
            importStandings={editing.actions.importStandings}
            onImported={(imported) => {
              refreshThen(() => {
                onImported(imported)
              })
            }}
            onCancel={onClose}
            isFinishing={isFinishing}
          />
        )}
      </EditorLoadView>
    </Sheet>
  )
}
