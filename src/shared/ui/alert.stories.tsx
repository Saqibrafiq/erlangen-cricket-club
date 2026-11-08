import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { Alert, RetryAlert, SignInRequiredAlert } from './alert'

const meta = {
  title: 'Shared/Alert',
  component: Alert,
  args: { children: 'The photo is too large. Choose one under 4 MB.' },
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SignInRequired: Story = {
  render: () => <SignInRequiredAlert signInHref="/login" />,
}

export const Retry: Story = {
  render: () => <RetryAlert message="The player could not be loaded." onRetry={fn()} />,
}
