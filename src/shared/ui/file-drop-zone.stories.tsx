import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

import { FileDropZone } from './file-drop-zone'
import { FormField } from './form-field'

function Demo({ error }: { error?: string }) {
  const [name, setName] = useState<string | null>(null)

  return (
    <div className="max-w-lg">
      <FormField
        id="table"
        label="Points table (CSV)"
        hint="Nothing is saved until you confirm."
        error={error}
      >
        {(control) => (
          <FileDropZone
            control={control}
            accept=".csv,text/csv"
            onFile={(file) => {
              setName(file.name)
            }}
          >
            <FileSpreadsheet aria-hidden="true" className="size-8 text-brand-primary" />
            <span className="font-medium">{name ?? 'Choose CSV file'}</span>
            <span className="text-sm text-text-muted">
              {name ? 'Choose another file' : 'or drop it here'}
            </span>
          </FileDropZone>
        )}
      </FormField>
    </div>
  )
}

const meta = {
  title: 'Shared/FileDropZone',
  component: Demo,
} satisfies Meta<typeof Demo>

export default meta

type Story = StoryObj<typeof meta>

/** Click, press Enter or Space, or drop a file. */
export const Default: Story = {}

export const WithError: Story = { args: { error: 'Please choose a CSV file.' } }
