import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  ECC_TEAM,
  makeCompletedFixture,
  makeInnings,
  makeScheduledFixture,
  NCC_TEAM,
} from '../test-factories'
import { FixtureCard } from './fixture-card'

const meta = {
  title: 'Fixtures/FixtureCard',
  component: FixtureCard,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: { fixture: makeCompletedFixture() },
} satisfies Meta<typeof FixtureCard>

export default meta

type Story = StoryObj<typeof meta>

export const LostFinal: Story = {}

export const WonByWickets: Story = {
  args: {
    fixture: makeCompletedFixture({
      stage: 'league',
      innings: [makeInnings(NCC_TEAM, 176, 10, '18.1'), makeInnings(ECC_TEAM, 182, 2, '14.5')],
    }),
  },
}

export const DlsTieSecondInningsNotPlayed: Story = {
  args: {
    fixture: makeCompletedFixture({
      stage: 'league',
      innings: [makeInnings(NCC_TEAM, 156, 8)],
      result: { kind: 'tie', isDls: true },
    }),
  },
}

export const Forfeit: Story = {
  args: {
    fixture: makeCompletedFixture({
      stage: 'league',
      result: { kind: 'forfeit', winnerTeamId: NCC_TEAM.id },
    }),
  },
}

export const Upcoming: Story = { args: { fixture: makeScheduledFixture() } }

export const Cancelled: Story = { args: { fixture: makeScheduledFixture({ status: 'cancelled' }) } }
