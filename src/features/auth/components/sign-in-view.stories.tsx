import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import type { SignInState } from '../sign-in-state'
import { SignInView } from './sign-in-view'

function respondWith(result: SignInState) {
  return () => Promise.resolve(result)
}

const meta = {
  title: 'Auth/SignInView',
  component: SignInView,
  parameters: { layout: 'fullscreen' },
  args: {
    action: respondWith({ status: 'idle' }),
    redirectTo: '/admin',
  },
} satisfies Meta<typeof SignInView>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const WrongPassword: Story = {
  args: {
    action: respondWith({ status: 'rejected', reason: 'credentials', email: 'admin@example.com' }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Sign in' }))
    await expect(await canvas.findByRole('alert')).toBeVisible()
  },
}

export const Locked: Story = {
  args: {
    action: respondWith({ status: 'rejected', reason: 'locked', email: 'admin@example.com' }),
  },
  play: WrongPassword.play,
}

export const InvalidFields: Story = {
  args: {
    action: respondWith({
      status: 'invalid',
      fieldErrors: { email: 'invalidEmail', password: 'required' },
      email: 'admin',
    }),
  },
  play: WrongPassword.play,
}

export const ServerError: Story = {
  args: { action: respondWith({ status: 'error', email: 'admin@example.com' }) },
  play: WrongPassword.play,
}
