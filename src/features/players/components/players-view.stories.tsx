import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { createSquad, PLAYER, PLAYER_WITH_DETAILS, PLAYER_WITHOUT_PHOTO } from '../test-factories'
import { PlayersView } from './players-view'

const meta = {
  title: 'Players/PlayersView',
  component: PlayersView,
  args: {
    players: [PLAYER, PLAYER_WITH_DETAILS, PLAYER_WITHOUT_PHOTO],
    joinHref: '/membership',
    facts: { season: '2026', clubTeams: 2, competitions: 4 },
  },
} satisfies Meta<typeof PlayersView>

export default meta

type Story = StoryObj<typeof meta>

/** Office, playing role, and initials when a player has no photo. */
export const Squad: Story = {}

/** The whole club (45 fictional players): team and role filters appear; every third has no photo. */
export const FullSquad: Story = { args: { players: createSquad(45) } }

/** Before the season has fixtures: only the player count. */
export const WithoutSeason: Story = { args: { facts: null } }

export const NoPlayersYet: Story = { args: { players: [] } }
