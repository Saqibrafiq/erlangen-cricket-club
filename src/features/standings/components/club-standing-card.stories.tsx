import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { STANDINGS_ROWS } from '../test-factories'
import { ClubStandingCard } from './club-standing-card'

const [, ECC_ROW] = STANDINGS_ROWS

if (!ECC_ROW) {
  throw new Error('Story data needs a club row')
}

const meta = {
  title: 'Standings/ClubStandingCard',
  component: ClubStandingCard,
  args: { row: ECC_ROW, teamCount: 8 },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClubStandingCard>

export default meta

type Story = StoryObj<typeof meta>

/** On a competition page: no link, the table follows below. */
export const OnCompetitionPage: Story = {}

/** On the overview: names and links its competition. */
export const OnOverview: Story = {
  args: {
    competition: {
      title: 'BCV T20 Regionalliga Bayern 2026',
      href: '/standings/bcv-t20-regionalliga-bayern-2026',
    },
  },
}
