import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SectionHeading } from './section-heading'

const meta = {
  title: 'Shared/SectionHeading',
  component: SectionHeading,
  args: { id: 'section-heading', eyebrow: 'Fees', heading: 'Choose your membership' },
} satisfies Meta<typeof SectionHeading>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIntro: Story = {
  args: { intro: 'Annual fees, with reduced fees for youth (up to 18) and students.' },
}
