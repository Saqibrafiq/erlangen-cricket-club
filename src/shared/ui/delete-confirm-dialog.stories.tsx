import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { DeleteConfirmDialog, type DeleteResult } from './delete-confirm-dialog'

const meta = {
  title: 'Shared/DeleteConfirmDialog',
  component: DeleteConfirmDialog,
  args: {
    title: 'Remove Saqib Rafiq?',
    description: 'The profile and photo are deleted from the website. This cannot be undone.',
    onDelete: (): Promise<DeleteResult> => Promise.resolve({ status: 'deleted' }),
    onDeleted: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof DeleteConfirmDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Press Delete: the dialog stays open and says why. */
export const Fails: Story = {
  args: { onDelete: () => Promise.resolve({ status: 'error' }) },
}

/** After a delete, while the page is fetched again. */
export const Finishing: Story = { args: { isFinishing: true } }
