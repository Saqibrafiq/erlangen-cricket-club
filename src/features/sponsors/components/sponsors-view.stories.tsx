import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SPONSOR, TITLE_SPONSOR } from '../test-factories'
import { SponsorsView } from './sponsors-view'

const meta = {
  title: 'Sponsors/SponsorsView',
  component: SponsorsView,
  args: { sponsors: [TITLE_SPONSOR, SPONSOR], contactHref: '/contact' },
} satisfies Meta<typeof SponsorsView>

export default meta

type Story = StoryObj<typeof meta>

export const TitleSponsorAndSponsor: Story = {}

/** A sponsor without logo or links still gets a complete card. */
export const MinimalSponsor: Story = {
  args: { sponsors: [{ ...SPONSOR, logo: null, website: null, announcementHref: null }] },
}

export const NoSponsorsYet: Story = { args: { sponsors: [] } }
