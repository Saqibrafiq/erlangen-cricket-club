import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { JOURNEY_INFO } from '../test-factories'
import { JourneyView } from './journey-view'

const meta = {
  title: 'Journey/JourneyView',
  component: JourneyView,
  args: { info: JOURNEY_INFO, membershipHref: '/membership' },
} satisfies Meta<typeof JourneyView>

export default meta

type Story = StoryObj<typeof meta>

export const Complete: Story = {}

/** Before the story and milestones are written in the admin. */
export const NotFilledIn: Story = {
  args: { info: { chapters: [], milestones: [] } },
}
