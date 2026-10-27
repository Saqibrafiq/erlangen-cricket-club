import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from './button'
import { formControlClassName } from './form-field'
import { Sheet } from './sheet'

const meta = {
  title: 'Shared/Sheet',
  component: Sheet,
  args: {
    open: true,
    onOpenChange: () => undefined,
    title: 'Edit player',
    description: 'Changes appear on the website right away.',
    closeLabel: 'Close',
    children: (
      <div className="space-y-4">
        <label className="block space-y-1.5 text-sm font-medium">
          <span>Name</span>
          <input defaultValue="Saqib Rafiq" className={formControlClassName} />
        </label>
        <Button>Save</Button>
      </div>
    ),
  },
} satisfies Meta<typeof Sheet>

export default meta

type Story = StoryObj<typeof meta>

export const Open: Story = {}

export const WithoutDescription: Story = { args: { description: undefined } }

/** For writing, e.g. a news article. */
export const Wide: Story = { args: { size: 'wide', title: 'Write article' } }

/** Opened from a button, as on the players page. */
export const Interactive: Story = {
  args: { open: false },
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <>
        <Button
          onClick={() => {
            setIsOpen(true)
          }}
        >
          Edit player
        </Button>
        <Sheet {...args} open={isOpen} onOpenChange={setIsOpen} />
      </>
    )
  },
}
