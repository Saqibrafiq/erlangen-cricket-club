import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  ECC_TEAM,
  makeCompletedFixture,
  makeInnings,
  makeScheduledFixture,
  NCC_TEAM,
} from '../test-factories'
import { CompetitionFixtures } from './competition-fixtures'

const COMPETITION = {
  id: 2,
  slug: 'dcb-bundesliga-suedost-bayern-2026',
  name: 'DCB-Bundesliga Südost: Bayern',
  season: '2026',
  isFeatured: false,
}

const meta = {
  title: 'Fixtures/CompetitionFixtures',
  component: CompetitionFixtures,
  args: {
    detail: {
      competition: COMPETITION,
      clubTeams: [ECC_TEAM],
      record: { played: 2, won: 1, lost: 1, tied: 0, noResult: 0 },
      fixtures: [
        makeScheduledFixture({ id: 3, competition: COMPETITION }),
        makeCompletedFixture({
          id: 1,
          stage: 'league',
          competition: COMPETITION,
          teams: [ECC_TEAM, NCC_TEAM],
          innings: [
            makeInnings(ECC_TEAM, 336, 9, '48.4', 50),
            makeInnings(NCC_TEAM, 337, 6, '48.4', 50),
          ],
        }),
        makeCompletedFixture({
          id: 2,
          stage: 'league',
          competition: COMPETITION,
          teams: [NCC_TEAM, ECC_TEAM],
          innings: [],
          result: { kind: 'forfeit', winnerTeamId: ECC_TEAM.id },
        }),
      ],
    },
  },
} satisfies Meta<typeof CompetitionFixtures>

export default meta

type Story = StoryObj<typeof meta>

export const Fixtures: Story = {}

export const NoFixturesYet: Story = {
  args: {
    detail: {
      ...meta.args.detail,
      record: { played: 0, won: 0, lost: 0, tied: 0, noResult: 0 },
      fixtures: [],
    },
  },
}
