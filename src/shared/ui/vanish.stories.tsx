import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Button } from './button'
import { Vanish } from './vanish'

function VanishDemo() {
  const [isVanishing, setIsVanishing] = useState(false)

  return (
    <div className="max-w-sm space-y-6">
      <Vanish isVanishing={isVanishing}>
        <div className="rounded-3xl border border-border-default bg-surface-default p-8 shadow-sm">
          <p className="font-display text-2xl font-bold">mein-banker</p>
          <p className="text-text-muted">Title sponsor since 2024</p>
        </div>
      </Vanish>
      <Button
        variant={isVanishing ? 'secondary' : 'danger'}
        onClick={() => {
          setIsVanishing(!isVanishing)
        }}
      >
        {isVanishing ? 'Bring it back' : 'Delete'}
      </Button>
    </div>
  )
}

const meta = {
  title: 'Shared/Vanish',
  component: Vanish,
  args: { isVanishing: false, children: null },
  render: () => <VanishDemo />,
} satisfies Meta<typeof Vanish>

export default meta

type Story = StoryObj<typeof meta>

/** Crumbles into dust and drifts away on delete; a plain fade under reduced motion. */
export const Default: Story = {}
