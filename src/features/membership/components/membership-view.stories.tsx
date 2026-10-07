import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MEMBERSHIP_INFO } from '../test-factories'
import { MembershipView } from './membership-view'

const meta = {
  title: 'Membership/MembershipView',
  component: MembershipView,
  args: { info: MEMBERSHIP_INFO, contactHref: '/contact', directionsHref: '/contact#ground' },
} satisfies Meta<typeof MembershipView>

export default meta

type Story = StoryObj<typeof meta>

export const Complete: Story = {}

/** Before the board has filled in the membership page in the admin. */
export const NotFilledIn: Story = {
  args: {
    info: { ...MEMBERSHIP_INFO, heroImage: null, fees: [], sessions: [], applicationForm: null },
  },
}
