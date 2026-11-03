'use client'

import { Download, FileSpreadsheet, LoaderCircle } from 'lucide-react'
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

import { CompetitionTargetFields, getInitialTarget, NEW_COMPETITION } from '@/features/competitions'
import { Link } from '@/i18n/navigation'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { Button } from '@/shared/ui/button'
import { FileDropZone } from '@/shared/ui/file-drop-zone'
import { FormField } from '@/shared/ui/form-field'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'

import {
  FIXTURES_CSV_TEMPLATE,
  type FixturesCsvResult,
  parseFixturesCsv,
} from '../../domain/fixtures-csv'
import { diffFixtures } from '../../domain/fixtures-diff'
import type {
  FixtureEditing,
  FixtureEditorResult,
  FixtureImportData,
  ImportFixturesResult,
} from '../../editor-types'
import { FixturesCsvErrors, FixturesImportPreview } from './fixtures-import-preview'

export type ImportedSchedule = Extract<ImportFixturesResult, { status: 'imported' }>

export type FixturesImporterProps = {
  editing: FixtureEditing
  onClose: () => void
  /** Called once the page has been refreshed with the new schedule. */
  onImported: (result: ImportedSchedule) => void
}

type LoadState = { status: 'loading' } | FixtureEditorResult<FixtureImportData>
type CsvFile = { name: string; text: string; result: FixturesCsvResult }

const CSV_ACCEPT = '.csv,text/csv'
const TEMPLATE_FILE_NAME = 'ecc-fixtures-template.csv'
// A byte order mark makes Excel read the template as UTF-8 (ß, ü in ground addresses).
const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(`﻿${FIXTURES_CSV_TEMPLATE}`)}`

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
  data: FixtureImportData
  loginHref: string
  importFixtures: FixtureEditing['actions']['importFixtures']
  onImported: (result: ImportedSchedule) => void
  onCancel: () => void
  isFinishing: boolean
}

function ImportForm({
  data,
  loginHref,
  importFixtures,
  onImported,
  onCancel,
  isFinishing,
}: ImportFormProps) {
  const t = useTranslations('fixtures.import')
  const id = useId()
  const [target, setTarget] = useState(() => getInitialTarget(data.competitions, null))
  const [csv, setCsv] = useState<CsvFile | null>(null)
  const [result, setResult] = useState<ImportFixturesResult | null>(null)
  const [isImporting, startTransition] = useTransition()
  const isPending = isImporting || isFinishing

  const competition =
    target.target === NEW_COMPETITION
      ? undefined
      : data.competitions.find((candidate) => String(candidate.id) === target.target)
  const parsed = csv?.result
  const diff = parsed?.success
    ? diffFixtures(competition?.fixtures ?? [], parsed.fixtures, {
        teams: new Set(data.teams),
        grounds: new Set(data.grounds),
      })
    : null

  async function chooseFile(file: File) {
    const text = await file.text()
    setResult(null)
    setCsv({ name: file.name, text, result: parseFixturesCsv(text) })
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!csv) return
    const formData = new FormData(event.currentTarget)
    formData.set('csv', csv.text)
    startTransition(async () => {
      const imported = await importFixtures(formData)
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
      {result?.status === 'invalidFile' && <FixturesCsvErrors errors={result.errors} />}

      <CompetitionTargetFields
        competitions={data.competitions}
        value={target}
        onChange={setTarget}
        fieldErrors={result?.status === 'invalid' ? result.fieldErrors : undefined}
      />

      <div className="space-y-2">
        <FormField id={`${id}-file`} label={t('file')} hint={t('fileHint')}>
          {(control) => (
            <FileDropZone
              control={control}
              accept={CSV_ACCEPT}
              onFile={(file) => void chooseFile(file)}
            >
              <FileSpreadsheet aria-hidden="true" className="size-8 text-brand-primary" />
              <span className="font-medium">{csv ? csv.name : t('choose')}</span>
              <span className="text-sm text-text-muted">
                {csv ? t('chooseAnother') : t('drop')}
              </span>
            </FileDropZone>
          )}
        </FormField>
        <a
          href={TEMPLATE_HREF}
          download={TEMPLATE_FILE_NAME}
          className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-brand-primary underline-offset-4 hover:underline"
        >
          <Download aria-hidden="true" className="size-4" />
          {t('template')}
        </a>
      </div>

      {parsed && !parsed.success && <FixturesCsvErrors errors={parsed.errors} />}
      {diff && <FixturesImportPreview diff={diff} />}

      <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-border-default bg-surface-default px-6 py-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={!canImport}>
          {isPending && <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />}
          {isPending
            ? t('importing')
            : t('confirm', { count: parsed?.success ? parsed.fixtures.length : 0 })}
        </Button>
      </div>
    </form>
  )
}

/**
 * Adds a season's schedule from a CSV made from the league's PDF: pick the competition (or start
 * the new season), drop the file, check what changes, confirm. Nothing is saved before that.
 */
export function FixturesImporter({ editing, onClose, onImported }: FixturesImporterProps) {
  const t = useTranslations('fixtures.import')
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
          loginHref={editing.loginHref}
          importFixtures={editing.actions.importFixtures}
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
