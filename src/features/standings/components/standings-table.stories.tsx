import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { STANDINGS_ROWS } from '../test-factories'
import { StandingsTable } from './standings-table'

const meta = {
  title: 'Standings/StandingsTable',
  component: StandingsTable,
  args: { rows: STANDINGS_ROWS, caption: 'BCV T20 Regionalliga Bayern 2026' },
} satisfies Meta<typeof StandingsTable>

export default meta

type Story = StoryObj<typeof meta>

export const Ranked: Story = {}

/** Narrow viewport: the table scrolls inside its container with the team column pinned. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
