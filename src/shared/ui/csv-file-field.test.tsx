import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { CsvFileField } from './csv-file-field'

describe('CsvFileField', () => {
  it('passes on the chosen file', async () => {
    const onFile = vi.fn()
    renderWithIntl(<CsvFileField id="schedule" label="Schedule (CSV)" onFile={onFile} />)
    const file = new File(['Date,Time,Home,Away'], 'schedule.csv', { type: 'text/csv' })

    await userEvent.upload(screen.getByLabelText('Schedule (CSV)'), file)

    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('names the chosen file and offers another', () => {
    renderWithIntl(
      <CsvFileField id="schedule" label="Schedule (CSV)" fileName="2026.csv" onFile={vi.fn()} />,
    )

    expect(screen.getByText('2026.csv')).toBeInTheDocument()
    expect(screen.getByText('Choose another file')).toBeInTheDocument()
  })
})
