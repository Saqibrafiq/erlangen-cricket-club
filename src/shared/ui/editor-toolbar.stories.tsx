import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { EditorToolbar } from './editor-toolbar'

const meta = {
  title: 'Shared/EditorToolbar',
  component: EditorToolbar,
  args: { addLabel: 'Write article', onAdd: () => undefined },
} satisfies Meta<typeof EditorToolbar>

export default meta

type Story = StoryObj<typeof meta>

export const AddOnly: Story = {}

/** With content visitors don't see, such as draft articles. */
export const WithHiddenItems: Story = {
  args: {
    hidden: {
      summary: '2 drafts',
      hint: 'Not on the website until published.',
      items: [
        { id: 1, label: 'Season review 2026' },
        { id: 2, label: 'New title sponsor' },
      ],
      editLabel: (item) => `Edit “${item.label}”`,
      onEdit: () => undefined,
    },
  },
}

export const LoadingFailed: Story = { args: { error: 'Drafts could not be loaded.' } }
