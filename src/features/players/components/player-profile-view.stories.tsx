import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PLAYER, PLAYER_WITH_DETAILS, PLAYER_WITHOUT_PHOTO } from '../test-factories'
import { PlayerProfileView } from './player-profile-view'

const meta = {
  title: 'Players/PlayerProfileView',
  component: PlayerProfileView,
  args: {
    player: PLAYER_WITH_DETAILS,
    teammates: [PLAYER, PLAYER_WITHOUT_PHOTO],
    playersHref: '/players',
  },
} satisfies Meta<typeof PlayerProfileView>

export default meta

type Story = StoryObj<typeof meta>

/** Office, role, teams, bio and playing details; initials instead of a photo. */
export const WithPlayingDetails: Story = {}

/** As seeded from the old website: photo only. */
export const PhotoOnly: Story = { args: { player: PLAYER, teammates: [PLAYER_WITH_DETAILS] } }

export const OnlyPlayer: Story = { args: { player: PLAYER, teammates: [] } }
