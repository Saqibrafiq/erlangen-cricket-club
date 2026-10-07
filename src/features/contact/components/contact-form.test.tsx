import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { ContactFormState } from '../contact-form-state'
import { ContactForm } from './contact-form'

const EMAIL = 'erlangencricketclub@gmail.com'

function renderForm(result: ContactFormState) {
  const action = vi.fn<(state: ContactFormState, data: FormData) => Promise<ContactFormState>>(() =>
    Promise.resolve(result),
  )
  renderWithIntl(
    <ContactForm action={action} locale="en" contactEmail={EMAIL} privacyHref="/privacy" />,
  )
  return action
}

describe('ContactForm', () => {
  it('asks only for name, email, topic and message', () => {
    renderForm({ status: 'success' })

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email')
    expect(screen.getByRole('combobox', { name: 'What is it about?' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeRequired()
    expect(screen.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/privacy')
  })

  it('hides the honeypot field from people and assistive technology', () => {
    renderForm({ status: 'success' })

    expect(screen.queryByRole('textbox', { name: 'Leave this field empty' })).toBeNull()
  })

  it('sends what was typed together with the page language', async () => {
    const user = userEvent.setup()
    const action = renderForm({ status: 'success' })

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Asha Patel')
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'What is it about?' }),
      'Membership',
    )
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    const data = action.mock.calls[0]?.[1]
    expect(data?.get('name')).toBe('Asha Patel')
    expect(data?.get('topic')).toBe('membership')
    expect(data?.get('locale')).toBe('en')
  })

  it('confirms a sent message and moves focus to the confirmation', async () => {
    const user = userEvent.setup()
    renderForm({ status: 'success' })

    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('heading', { name: 'Thank you!' })).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull()
  })

  it('shows field errors, keeps the input and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    renderForm({
      status: 'invalid',
      fieldErrors: { email: 'invalidEmail', message: 'required' },
      values: { name: 'Asha Patel', email: 'asha@' },
    })

    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please check the highlighted fields.',
    )
    const email = screen.getByRole('textbox', { name: 'Email' })
    expect(email).toHaveFocus()
    expect(email).toHaveAccessibleDescription('Please enter a valid email address.')
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Asha Patel')
  })

  it('offers email as a way out when the message could not be stored', async () => {
    const user = userEvent.setup()
    renderForm({ status: 'error', values: { name: 'Asha Patel' } })

    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(EMAIL)
  })
})
