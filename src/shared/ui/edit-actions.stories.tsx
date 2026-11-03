import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { EditActions } from './edit-actions'

const meta = {
  title: 'Shared/EditActions',
  component: EditActions,
  args: {
    editLabel: 'Edit Saqib Rafiq',
    deleteLabel: 'Delete Saqib Rafiq',
    onEdit: () => undefined,
    onDelete: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="relative h-48 w-40 rounded-2xl bg-linear-to-b from-brand-surface to-media-overlay p-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditActions>

export default meta

type Story = StoryObj<typeof meta>

/** As over a player card or news card. */
export const OnCard: Story = {}

/** In a card's own row, as on fixture cards. */
export const Inline: Story = {
  args: { variant: 'inline', editLabel: 'Edit ECC-I v NCC-I', deleteLabel: 'Delete ECC-I v NCC-I' },
  decorators: [
    (Story) => (
      <div className="flex w-80 items-center justify-between rounded-lg border border-border-default bg-surface-default p-4">
        <span className="text-xs text-text-muted">Erlangen Cricket Ground</span>
        <Story />
      </div>
    ),
  ],
}
