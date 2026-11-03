'use client'

import { FileSpreadsheet, LoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  type ReactNode,
  type SubmitEvent,
  useCallback,
  useEffect,
  useId,
  useState,
  useTransition,
} from 'react'

import {
  CompetitionTargetFields,
  getInitialTarget,
  getTargetTitle,
  NEW_COMPETITION,
} from '@/features/competitions'
import { Link } from '@/i18n/navigation'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { Button } from '@/shared/ui/button'
import { FileDropZone } from '@/shared/ui/file-drop-zone'
import { FormField } from '@/shared/ui/form-field'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'

import { parseStandingsCsv, type StandingsCsvResult } from '../../domain/standings-csv'
import { diffStandings } from '../../domain/standings-diff'
import type {
  ImportStandingsResult,
  StandingsEditing,
  StandingsEditorResult,
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

type LoadState = { status: 'loading' } | StandingsEditorResult<StandingsImportData>
type CsvFile = { name: string; result: StandingsCsvResult }

const CSV_ACCEPT = '.csv,text/csv'

function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg bg-status-danger-surface p-3 text-sm font-medium text-status-danger-text"
    >
      {children}
    </div>
  )
}

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
      {result?.status === 'unauthorized' && (
        <Alert>
          {t('errors.unauthorized')}{' '}
          <Link href={loginHref} className="underline underline-offset-4">
            {t('errors.signIn')}
          </Link>
        </Alert>
      )}
      {result?.status === 'invalidFile' && <StandingsCsvErrors errors={result.errors} />}

      <CompetitionTargetFields
        competitions={data.competitions}
        alwaysIncludeId={competitionId}
        value={target}
        onChange={setTarget}
        fieldErrors={result?.status === 'invalid' ? result.fieldErrors : undefined}
      />

      <FormField id={`${id}-file`} label={t('file')} hint={t('fileHint')}>
        {(control) => (
          <FileDropZone
            control={control}
            accept={CSV_ACCEPT}
            onFile={(file) => void chooseFile(file)}
          >
            <FileSpreadsheet aria-hidden="true" className="size-8 text-brand-primary" />
            <span className="font-medium">{csv ? csv.name : t('choose')}</span>
            <span className="text-sm text-text-muted">{csv ? t('chooseAnother') : t('drop')}</span>
          </FileDropZone>
        )}
      </FormField>

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
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const { refreshThen, isFinishing } = useRefreshThen()
  const { getImportData } = editing.actions

  const load = useCallback(() => {
    setState({ status: 'loading' })
    void getImportData().then(setState)
  }, [getImportData])

  useEffect(() => {
    let isCurrent = true
    void getImportData().then((result) => {
      if (isCurrent) setState(result)
    })
    return () => {
      isCurrent = false
    }
  }, [getImportData])

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
      {state.status === 'loading' && <ImporterSkeleton label={t('loading')} />}
      {state.status === 'unauthorized' && (
        <p role="alert" className="space-x-1">
          <span>{t('errors.unauthorized')}</span>
          <Link href={editing.loginHref} className="font-medium underline underline-offset-4">
            {t('errors.signIn')}
          </Link>
        </p>
      )}
      {state.status === 'error' && (
        <div role="alert" className="space-y-3">
          <p>{t('errors.load')}</p>
          <Button variant="secondary" onClick={load}>
            {t('errors.retry')}
          </Button>
        </div>
      )}
      {state.status === 'ok' && (
        <ImportForm
          data={state.data}
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
    </Sheet>
  )
}
