import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { LocaleSwitcher } from './locale-switcher'

const meta = {
  title: 'Shared/LocaleSwitcher',
  component: LocaleSwitcher,
  parameters: { nextjs: { navigation: { pathname: '/fixtures' } } },
} satisfies Meta<typeof LocaleSwitcher>

export default meta

type Story = StoryObj<typeof meta>

export const English: Story = {}
