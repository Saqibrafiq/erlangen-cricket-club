import { expect, type Page } from '@playwright/test'

// The seed creates this account only when both variables are set (CI does; see seed-e2e-user.ts).
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
// Signing in loads the site in full; under `pnpm dev` the first load compiles for a while.
export const SIGN_IN_TIMEOUT_MS = 60_000

/** The signed-in editor's avatar in the header, which opens the account menu. */
export function accountMenuButton(page: Page) {
  return page.getByRole('button', { name: /^Account menu/ })
}

/** The sign-in panel that the header's account icon opens for visitors. */
export async function openSignInPanel(page: Page) {
  await page.getByRole('button', { name: 'Admin login' }).click()
  return page.getByRole('dialog', { name: 'Club admin' })
}

/**
 * Signs the test account in from the header panel, as editors do, and waits until the website
 * shows it signed in (edit mode). Stays on `path`.
 */
export async function signIn(page: Page, path = '/'): Promise<void> {
  await page.goto(path)
  const panel = await openSignInPanel(page)
  await panel.getByLabel('Email').fill(ADMIN_EMAIL ?? '')
  await panel.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD ?? '')
  await panel.getByRole('button', { name: 'Sign in' }).click()
  await expect(accountMenuButton(page)).toBeVisible({ timeout: SIGN_IN_TIMEOUT_MS })
}
