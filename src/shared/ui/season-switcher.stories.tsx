import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SeasonSwitcher } from './season-switcher'

const meta = {
  title: 'Shared/SeasonSwitcher',
  component: SeasonSwitcher,
  args: {
    label: 'Seasons',
    seasons: ['2027', '2026', '2025'],
    current: '2027',
    hrefFor: (season: string) => (season === '2027' ? '/standings' : `/standings/season/${season}`),
  },
} satisfies Meta<typeof SeasonSwitcher>

export default meta

type Story = StoryObj<typeof meta>

/** The current season, on the standings page. */
export const CurrentSeason: Story = {}

/** A past season's archive page. */
export const PastSeason: Story = { args: { current: '2026' } }

/** One season only: nothing to switch to, so nothing is shown. */
export const SingleSeason: Story = { args: { seasons: ['2027'] } }
