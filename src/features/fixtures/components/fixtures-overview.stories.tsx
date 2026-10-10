import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { ECC_TEAM, makeCompletedFixture, makeScheduledFixture, NCC_TEAM } from '../test-factories'
import { FixturesOverview } from './fixtures-overview'
import { FixturesSkeleton } from './fixtures-skeleton'

const ECC_II = { id: 3, name: 'Erlangen Cricket Club II', shortName: 'ECC-II', isClubTeam: true }
const T20 = {
  id: 1,
  slug: 'bcv-t20-regionalliga-bayern-2026',
  name: 'BCV T20 Regionalliga Bayern',
  season: '2026',
  isFeatured: false,
}
const VERBANDSLIGA = {
  id: 4,
  slug: 'bcv-t20-1-verbandsliga-2026',
  name: 'BCV T20 1. Verbandsliga',
  season: '2026',
  isFeatured: false,
}

const meta = {
  title: 'Fixtures/FixturesOverview',
  component: FixturesOverview,
  args: {
    overview: {
      fixtures: [
        makeScheduledFixture({ id: 1, competition: T20 }),
        makeCompletedFixture({ id: 2, competition: T20 }),
        makeCompletedFixture({
          id: 3,
          competition: VERBANDSLIGA,
          teams: [ECC_II, NCC_TEAM],
          innings: [],
          result: { kind: 'forfeit', winnerTeamId: ECC_II.id },
          clubOutcome: 'won',
        }),
        makeCompletedFixture({
          id: 4,
          competition: VERBANDSLIGA,
          teams: [NCC_TEAM, ECC_II],
          innings: [],
          result: { kind: 'walkover', winnerTeamId: NCC_TEAM.id },
          clubOutcome: 'lost',
        }),
      ],
      competitionsByTeam: [
        { team: ECC_TEAM, competitions: [T20] },
        { team: ECC_II, competitions: [VERBANDSLIGA] },
      ],
    },
  },
} satisfies Meta<typeof FixturesOverview>

export default meta

type Story = StoryObj<typeof meta>

export const AllFixtures: Story = {}

export const FilteredToForfeits: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('radio', { name: /Forfeit/ }))
    await expect(canvas.getAllByRole('article')).toHaveLength(1)
  },
}

export const Empty: Story = { args: { overview: { fixtures: [], competitionsByTeam: [] } } }

export const Loading: Story = { render: () => <FixturesSkeleton /> }
