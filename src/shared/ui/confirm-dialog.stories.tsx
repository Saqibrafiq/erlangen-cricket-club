import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ConfirmDialog } from './confirm-dialog'

const meta = {
  title: 'Shared/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Remove Akmal Sandhu?',
    description: 'The profile and photo are deleted from the website. This cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: () => undefined,
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}

export const Pending: Story = { args: { isPending: true, confirmLabel: 'Deleting…' } }

export const Failed: Story = { args: { error: 'Could not delete. Please try again.' } }
