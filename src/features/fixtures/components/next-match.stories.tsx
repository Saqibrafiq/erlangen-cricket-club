import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { makeScheduledFixture } from '../test-factories'
import { NextMatch } from './next-match'

const meta = {
  title: 'Fixtures/NextMatch',
  component: NextMatch,
  args: { fixture: makeScheduledFixture() },
} satisfies Meta<typeof NextMatch>

export default meta

type Story = StoryObj<typeof meta>

export const WithTimeAndVenue: Story = {}

export const DateOnly: Story = {
  args: { fixture: makeScheduledFixture({ startTime: null, venue: null }) },
}
