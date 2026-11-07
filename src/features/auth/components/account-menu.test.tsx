import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EDIT_MODE_COOKIE } from '@/shared/config/edit-mode'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import type { AccountActions } from '../sign-in-state'
import { Toaster } from '@/shared/ui/toast'

import { AccountMenu } from './account-menu'
import { rememberWelcome } from './welcome'

const PROFILE_LOAD_TIMEOUT_MS = 10_000
const ACCOUNT = { name: 'Saqib Rafiq', email: 'saqib@example.com' }

function makeActions(overrides: Partial<AccountActions> = {}): AccountActions {
  return {
    getAccount: vi.fn(() => Promise.resolve({ status: 'ok' as const, account: ACCOUNT })),
    saveAccount: vi.fn(() =>
      Promise.resolve({
        status: 'saved' as const,
        account: { name: 'Saqib A. Rafiq', email: 'saqib@example.com' },
      }),
    ),
    signOut: vi.fn(() => Promise.resolve()),
    signIn: vi.fn(() => Promise.resolve({ status: 'idle' as const })),
    ...overrides,
  }
}

function renderMenu(actions = makeActions()) {
  renderWithIntl(<AccountMenu loginHref="/login" actions={actions} />)
  return actions
}

function enterEditMode() {
  document.cookie = `${EDIT_MODE_COOKIE}=1; path=/`
}

// The test setup stubs it for next/link; unstubbing `location` must not take it away too.
const { IntersectionObserver } = globalThis

afterEach(() => {
  document.cookie = `${EDIT_MODE_COOKIE}=; path=/; max-age=0`
  vi.unstubAllGlobals()
  vi.stubGlobal('IntersectionObserver', IntersectionObserver)
})

describe('AccountMenu', { timeout: 3 * PROFILE_LOAD_TIMEOUT_MS }, () => {
  it('lets visitors sign in from a panel in the header, loading no account', async () => {
    const actions = renderMenu()

    await userEvent.click(screen.getByRole('button', { name: 'Admin login' }))

    const panel = await screen.findByRole('dialog', { name: 'Club admin' })
    expect(within(panel).getByLabelText('Email')).toBeInTheDocument()
    expect(within(panel).getByLabelText('Password', { exact: true })).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(actions.getAccount).not.toHaveBeenCalled()
  })

  it("shows a signed-in editor's initials, opening who they are and what they can do", async () => {
    enterEditMode()
    renderMenu()

    const trigger = await screen.findByRole('button', { name: 'Account menu for Saqib Rafiq' })
    expect(trigger).toHaveTextContent('SR')
    await userEvent.click(trigger)

    const menu = await screen.findByRole('menu')
    expect(menu).toHaveTextContent('Saqib Rafiq')
    expect(menu).toHaveTextContent('saqib@example.com')
    expect(within(menu).getByRole('menuitem', { name: 'Admin panel' })).toHaveAttribute(
      'href',
      '/admin',
    )
    expect(within(menu).getByRole('menuitem', { name: 'Edit profile' })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('greets the editor by first name right after signing in, once', async () => {
    enterEditMode()
    rememberWelcome()
    renderWithIntl(
      <>
        <AccountMenu loginHref="/login" actions={makeActions()} />
        <Toaster closeLabel="Close" />
      </>,
    )

    expect(
      await screen.findByText('Welcome back, Saqib. You can edit the website now.'),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('ecc-welcome')).toBeNull()
  })

  it('edits the profile and shows the new name', async () => {
    enterEditMode()
    const actions = renderMenu()

    await userEvent.click(await screen.findByRole('button', { name: /Account menu for/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit profile' }))
    const sheet = await screen.findByRole(
      'dialog',
      { name: 'Your profile' },
      { timeout: PROFILE_LOAD_TIMEOUT_MS },
    )
    const name = within(sheet).getByLabelText(/^Name/)
    expect(name).toHaveValue('Saqib Rafiq')
    await userEvent.clear(name)
    await userEvent.type(name, 'Saqib A. Rafiq')
    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(actions.saveAccount).toHaveBeenCalledOnce()
    })
    expect(
      await screen.findByRole('button', { name: 'Account menu for Saqib A. Rafiq' }),
    ).toBeInTheDocument()
  })

  it('shows field errors from the server, e.g. an email in use', async () => {
    enterEditMode()
    renderMenu(
      makeActions({
        saveAccount: vi.fn(() =>
          Promise.resolve({
            status: 'invalid' as const,
            fieldErrors: { email: 'emailTaken' as const },
          }),
        ),
      }),
    )

    await userEvent.click(await screen.findByRole('button', { name: /Account menu for/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit profile' }))
    const sheet = await screen.findByRole(
      'dialog',
      { name: 'Your profile' },
      { timeout: PROFILE_LOAD_TIMEOUT_MS },
    )
    await userEvent.click(within(sheet).getByRole('button', { name: 'Save' }))

    expect(within(sheet).getByLabelText(/^Email/)).toHaveAccessibleDescription(
      expect.stringContaining('Another account already uses this email.') as unknown,
    )
  })

  it('signs out and reloads the page for visitors', async () => {
    enterEditMode()
    const reload = vi.fn()
    vi.stubGlobal('location', {
      href: window.location.href,
      origin: window.location.origin,
      reload,
    })
    const actions = renderMenu()

    await userEvent.click(await screen.findByRole('button', { name: /Account menu for/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Sign out' }))

    await waitFor(() => {
      expect(reload).toHaveBeenCalledOnce()
    })
    expect(actions.signOut).toHaveBeenCalledOnce()
  })

  it('offers to sign in again when the session has ended', async () => {
    enterEditMode()
    renderMenu(
      makeActions({
        getAccount: vi.fn(() => Promise.resolve({ status: 'unauthorized' as const })),
      }),
    )

    expect(await screen.findByRole('button', { name: 'Admin login' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Account menu/ })).toBeNull()
  })
})
