'use client'

import { FileSpreadsheet } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { FileDropZone } from './file-drop-zone'
import { FormField } from './form-field'

const CSV_ACCEPT = '.csv,text/csv'

export type CsvFileFieldProps = {
  id: string
  label: string
  hint?: string
  /** The chosen file's name; nothing chosen yet when absent. */
  fileName?: string
  onFile: (file: File) => void
}

/** Choose or drop a CSV file for an import; shows the chosen file's name once there is one. */
export function CsvFileField({ id, label, hint, fileName, onFile }: CsvFileFieldProps) {
  const t = useTranslations('csvFile')
  return (
    <FormField id={id} label={label} hint={hint}>
      {(control) => (
        <FileDropZone control={control} accept={CSV_ACCEPT} onFile={onFile}>
          <FileSpreadsheet aria-hidden="true" className="size-8 text-brand-primary" />
          <span className="font-medium">{fileName ?? t('choose')}</span>
          <span className="text-sm text-text-muted">
            {fileName ? t('chooseAnother') : t('drop')}
          </span>
        </FileDropZone>
      )}
    </FormField>
  )
}
