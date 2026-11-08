import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { CsvFileField } from './csv-file-field'

const meta = {
  title: 'Shared/CsvFileField',
  component: CsvFileField,
  args: {
    id: 'schedule',
    label: 'Schedule (CSV)',
    hint: 'Nothing is saved until you confirm below.',
    onFile: fn(),
  },
} satisfies Meta<typeof CsvFileField>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const FileChosen: Story = { args: { fileName: 'bcv-t20-2026.csv' } }
