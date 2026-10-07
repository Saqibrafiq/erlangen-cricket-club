import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import type { ContactFormState } from '../contact-form-state'
import { ContactForm } from './contact-form'

function respondWith(result: ContactFormState) {
  return () => Promise.resolve(result)
}

const meta = {
  title: 'Contact/ContactForm',
  component: ContactForm,
  args: {
    action: respondWith({ status: 'success' }),
    locale: 'en',
    contactEmail: 'erlangencricketclub@gmail.com',
    privacyHref: '/privacy',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContactForm>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send message' }))
    await expect(await canvas.findByRole('heading', { name: 'Thank you!' })).toBeVisible()
  },
}

export const WithErrors: Story = {
  args: {
    action: respondWith({
      status: 'invalid',
      fieldErrors: { name: 'required', email: 'invalidEmail', message: 'required' },
      values: { email: 'asha@' },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send message' }))
    await expect(await canvas.findByRole('alert')).toBeVisible()
  },
}

export const CouldNotBeStored: Story = {
  args: { action: respondWith({ status: 'error', values: { name: 'Asha Patel' } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Send message' }))
    await expect(await canvas.findByRole('alert')).toBeVisible()
  },
}
