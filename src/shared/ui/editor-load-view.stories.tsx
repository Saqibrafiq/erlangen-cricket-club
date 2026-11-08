import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import type { EditorLoadState } from '@/shared/lib/use-editor-load'

import { EditorLoadView } from './editor-load-view'
import { Skeleton } from './skeleton'

/** A player editor's body in each state. */
function PlayerEditorBody({ state }: { state: EditorLoadState<string> }) {
  return (
    <EditorLoadView
      state={state}
      skeleton={
        <div role="status" aria-label="Loading the player" className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      }
      loadError="The player could not be loaded. Please try again."
      signInHref="/login"
      onRetry={fn()}
    >
      {(name) => <p>The form for {name}</p>}
    </EditorLoadView>
  )
}

const meta = {
  title: 'Shared/EditorLoadView',
  component: PlayerEditorBody,
  args: { state: { status: 'loading' } },
} satisfies Meta<typeof PlayerEditorBody>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {}

export const Ready: Story = { args: { state: { status: 'ok', data: 'Saqib Rafiq' } } }

export const SessionEnded: Story = { args: { state: { status: 'unauthorized' } } }

export const Failed: Story = { args: { state: { status: 'error' } } }
