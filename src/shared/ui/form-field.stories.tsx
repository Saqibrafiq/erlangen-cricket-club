import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FormField, formControlClassName } from './form-field'

const meta = {
  title: 'Shared/FormField',
  component: FormField,
  args: {
    id: 'email',
    label: 'Email',
    children: (control) => <input type="email" {...control} className={formControlClassName} />,
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormField>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'We only use it to reply to you.' } }

export const Invalid: Story = { args: { error: 'Enter a valid email address.' } }

export const OptionalTextarea: Story = {
  args: {
    id: 'message',
    label: 'Message',
    optionalLabel: '(optional)',
    children: (control) => <textarea rows={4} {...control} className={formControlClassName} />,
  },
}

export const Select: Story = {
  args: {
    id: 'interest',
    label: 'I am interested in',
    children: (control) => (
      <select {...control} className={formControlClassName} defaultValue="">
        <option value="" disabled>
          Choose…
        </option>
        <option value="active">Active membership</option>
      </select>
    ),
  },
}
