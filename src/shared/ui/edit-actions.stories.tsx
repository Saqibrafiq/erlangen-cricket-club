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
