import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FileDropZone } from './file-drop-zone'
import { FormField } from './form-field'

function renderZone(onFile = vi.fn(), error?: string) {
  render(
    <FormField id="table" label="Points table" error={error}>
      {(control) => (
        <FileDropZone control={control} accept=".csv" onFile={onFile}>
          <span>Choose CSV file</span>
        </FileDropZone>
      )}
    </FormField>,
  )
  return onFile
}

const CSV = new File(['TEAM'], 'table.csv', { type: 'text/csv' })

describe('FileDropZone', () => {
  it('is a labelled file input that reports the chosen file', async () => {
    const onFile = renderZone()

    const input = screen.getByLabelText(/Points table/)
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('accept', '.csv')
    await userEvent.upload(input, CSV)

    expect(onFile).toHaveBeenCalledWith(CSV)
  })

  it('accepts a dropped file', () => {
    const onFile = renderZone()

    fireEvent.drop(screen.getByText('Choose CSV file'), { dataTransfer: { files: [CSV] } })

    expect(onFile).toHaveBeenCalledWith(CSV)
  })

  it('ignores a drop without files and marks the input invalid with an error', () => {
    const onFile = renderZone(vi.fn(), 'Please choose a file.')

    fireEvent.dragOver(screen.getByText('Choose CSV file'))
    fireEvent.dragLeave(screen.getByText('Choose CSV file'))
    fireEvent.drop(screen.getByText('Choose CSV file'), { dataTransfer: { files: [] } })

    expect(onFile).not.toHaveBeenCalled()
    expect(screen.getByLabelText(/Points table/)).toHaveAccessibleDescription(
      'Please choose a file.',
    )
  })
})
