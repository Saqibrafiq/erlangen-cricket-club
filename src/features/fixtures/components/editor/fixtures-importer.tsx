'use client'

import { Download, LoaderCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type SubmitEvent, useId, useState, useTransition } from 'react'

import { CompetitionTargetFields, getInitialTarget, NEW_COMPETITION } from '@/features/competitions'
import { useEditorLoad } from '@/shared/lib/use-editor-load'
import { useRefreshThen } from '@/shared/lib/use-refresh-then'
import { Button } from '@/shared/ui/button'
import { CsvFileField } from '@/shared/ui/csv-file-field'
import { EditorLoadView } from '@/shared/ui/editor-load-view'
import { Sheet } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { Alert, SignInRequiredAlert } from '@/shared/ui/alert'

import {
  FIXTURES_CSV_TEMPLATE,
  type FixturesCsvResult,
  parseFixturesCsv,
} from '../../domain/fixtures-csv'
import { diffFixtures } from '../../domain/fixtures-diff'
import { applyHomeGrounds } from '../../domain/home-grounds'
import type { FixtureEditing, FixtureImportData, ImportFixturesResult } from '../../editor-types'
import { FixturesCsvErrors, FixturesImportPreview } from './fixtures-import-preview'

export type ImportedSchedule = Extract<ImportFixturesResult, { status: 'imported' }>

export type FixturesImporterProps = {
  editing: FixtureEditing
  onClose: () => void
  /** Called once the page has been refreshed with the new schedule. */
  onImported: (result: ImportedSchedule) => void
}

type CsvFile = { name: string; text: string; result: FixturesCsvResult }

const TEMPLATE_FILE_NAME = 'ecc-fixtures-template.csv'
// A byte order mark makes Excel read the template as UTF-8 (ß, ü in ground addresses).
const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(`﻿${FIXTURES_CSV_TEMPLATE}`)}`

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
    ? diffFixtures(competition?.fixtures ?? [], applyHomeGrounds(parsed.fixtures, data.grounds), {
        teams: new Set(data.teams),
        grounds: new Set(data.grounds.map((ground) => ground.name)),
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
      {result?.status === 'unauthorized' && <SignInRequiredAlert signInHref={loginHref} />}
      {result?.status === 'invalidFile' && <FixturesCsvErrors errors={result.errors} />}

      <CompetitionTargetFields
        competitions={data.competitions}
        value={target}
        onChange={setTarget}
        fieldErrors={result?.status === 'invalid' ? result.fieldErrors : undefined}
      />

      <div className="space-y-2">
        <CsvFileField
          id={`${id}-file`}
          label={t('file')}
          hint={t('fileHint')}
          fileName={csv?.name}
          onFile={(file) => void chooseFile(file)}
        />
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
      </EditorLoadView>
    </Sheet>
  )
}
