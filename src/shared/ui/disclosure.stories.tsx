import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Disclosure } from './disclosure'

const meta = {
  title: 'Shared/Disclosure',
  component: Disclosure,
  args: {
    summary: 'Payment terms',
    children:
      'Fees are due by 31 March. Students and newcomers pay the reduced fee in their first year.',
    className: 'max-w-md rounded-2xl border border-border-default px-4 py-1',
    panelClassName: 'pb-3 text-sm text-text-muted',
  },
} satisfies Meta<typeof Disclosure>

export default meta

type Story = StoryObj<typeof meta>

/** Closed: click to see the chevron turn and the content grow into place. */
export const Closed: Story = {}

export const Open: Story = { args: { defaultOpen: true } }
