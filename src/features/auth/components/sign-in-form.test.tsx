import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { SignInState } from '../sign-in-state'
import { SignInForm } from './sign-in-form'

function respondWith(result: SignInState) {
  return vi.fn((_state: SignInState, _formData: FormData) => Promise.resolve(result))
}

describe('SignInForm', () => {
  it('labels both fields with the autocomplete hints password managers need', () => {
    renderWithIntl(<SignInForm action={respondWith({ status: 'idle' })} redirectTo="/admin" />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'username')
    expect(screen.getByLabelText('Password', { exact: true })).toHaveAttribute(
      'autocomplete',
      'current-password',
    )
  })

  it('sends the admin page to open afterwards with the credentials', async () => {
    const action = respondWith({ status: 'idle' })
    renderWithIntl(<SignInForm action={action} redirectTo="/admin/collections/news" />)

    await userEvent.type(screen.getByLabelText('Email'), 'admin@example.com')
    await userEvent.type(screen.getByLabelText('Password', { exact: true }), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(action).toHaveBeenCalled()
    })
    const [, formData] = action.mock.calls[0] ?? []
    expect(Object.fromEntries(formData?.entries() ?? [])).toEqual({
      redirect: '/admin/collections/news',
      email: 'admin@example.com',
      password: 'secret',
    })
  })

  it('announces wrong credentials and puts the cursor back in the password field', async () => {
    renderWithIntl(
      <SignInForm
        action={respondWith({
          status: 'rejected',
          reason: 'credentials',
          email: 'admin@example.com',
        })}
        redirectTo="/admin"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The email or password is incorrect.',
    )
    expect(screen.getByLabelText('Password', { exact: true })).toHaveFocus()
    expect(screen.getByLabelText('Email')).toHaveValue('admin@example.com')
  })

  it('loads the requested page in full after signing in, staying busy meanwhile', async () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { assign })
    renderWithIntl(
      <SignInForm
        action={respondWith({ status: 'success', redirectTo: '/players' })}
        redirectTo="/players"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('/players')
    })
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled()
    vi.unstubAllGlobals()
  })

  it('explains a locked account and server errors', async () => {
    const { unmount } = renderWithIntl(
      <SignInForm
        action={respondWith({ status: 'rejected', reason: 'locked', email: '' })}
        redirectTo="/admin"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/locked for 10 minutes/)
    unmount()

    renderWithIntl(
      <SignInForm action={respondWith({ status: 'error', email: '' })} redirectTo="/admin" />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/not possible right now/)
  })

  it('marks invalid fields and focuses the first one', async () => {
    renderWithIntl(
      <SignInForm
        action={respondWith({
          status: 'invalid',
          fieldErrors: { email: 'invalidEmail', password: 'required' },
          email: 'admin',
        })}
        redirectTo="/admin"
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    const email = await screen.findByLabelText('Email')
    await waitFor(() => {
      expect(email).toHaveFocus()
    })
    expect(email).toHaveAccessibleDescription('Please enter a valid email address.')
    expect(screen.getByLabelText('Password', { exact: true })).toHaveAccessibleDescription(
      'Please fill in this field.',
    )
  })

  it('shows and hides the password with a toggle button', async () => {
    renderWithIntl(<SignInForm action={respondWith({ status: 'idle' })} redirectTo="/admin" />)
    const password = screen.getByLabelText('Password', { exact: true })
    const toggle = screen.getByRole('button', { name: 'Show password' })

    expect(password).toHaveAttribute('type', 'password')
    await userEvent.click(toggle)
    expect(password).toHaveAttribute('type', 'text')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(toggle)
    expect(password).toHaveAttribute('type', 'password')
  })
})
