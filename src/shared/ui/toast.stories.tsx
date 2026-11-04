import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from './button'
import { toast, Toaster } from './toast'

function Demo() {
  return (
    <div className="min-h-64">
      <Button
        onClick={() => {
          toast('Profile saved.')
        }}
      >
        Save profile
      </Button>
      <Toaster closeLabel="Close" />
    </div>
  )
}

const meta = {
  title: 'Shared/Toast',
  component: Demo,
} satisfies Meta<typeof Demo>

export default meta

type Story = StoryObj<typeof meta>

/** A short confirmation that springs in, bottom right (bottom centre on phones), and leaves after a few seconds. */
export const Default: Story = {}
