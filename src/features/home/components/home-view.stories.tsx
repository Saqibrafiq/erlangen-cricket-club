import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HOME_DATA, MATCHDAY_BETWEEN_SEASONS } from '../test-factories'
import { HomeView } from './home-view'

const meta = {
  title: 'Home/HomeView',
  component: HomeView,
  parameters: { layout: 'fullscreen' },
  args: { data: HOME_DATA },
} satisfies Meta<typeof HomeView>

export default meta

type Story = StoryObj<typeof meta>

/** During the season: the next match as a ticket with countdown, then what follows. */
export const NextMatch: Story = {}

/** Between seasons: the next match card shows TBD until the new fixtures are entered. */
export const BetweenSeasons: Story = {
  args: { data: { ...HOME_DATA, matchday: MATCHDAY_BETWEEN_SEASONS, nextMatch: null } },
}

/** An away game whose start time is not known yet: no countdown. */
export const AwayTimeUnknown: Story = {
  args: {
    data: {
      ...HOME_DATA,
      matchday: {
        ...HOME_DATA.matchday,
        next: HOME_DATA.matchday.next && {
          ...HOME_DATA.matchday.next,
          venue: 'Nürnberg',
          startTime: null,
        },
      },
      nextMatch: { calendarHref: '/calendar/fixture-100.ics', kickoff: null },
    },
  },
}
