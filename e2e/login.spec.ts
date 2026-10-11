import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// The seed creates this account only when both variables are set (CI does; see seed-e2e-user.ts).
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
// Generous: under `pnpm dev` the admin compiles for a while on its first load.
const ADMIN_LOAD_TIMEOUT_MS = 60_000

test.describe('admin login', () => {
  test('opens from the header icon and passes axe', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Admin login' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page).toHaveTitle('Club admin | Erlangen Cricket Club')
    await expect(page.getByRole('heading', { level: 1, name: 'Club admin' })).toBeVisible()
    await expectNoAxeViolations(page)
  })

  test('says so when the email or password is wrong', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nobody@example.com')
    await page.getByLabel('Password', { exact: true }).fill('wrong password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Scoped to the page: Next's route announcer is an (empty) alert too.
    await expect(page.getByRole('main').getByRole('alert')).toHaveText(
      'The email or password is incorrect.',
    )
    await expect(page.getByLabel('Password', { exact: true })).toBeFocused()
  })

  test("sends Payload's own login page to the club's", async ({ page }) => {
    await page.goto('/admin/login?redirect=%2Fadmin%2Fcollections%2Fnews')

    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin%2Fcollections%2Fnews$/)
  })

  test('signs an editor in and opens the admin', async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.')
    test.setTimeout(2 * ADMIN_LOAD_TIMEOUT_MS)

    await page.goto('/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL ?? '')
    await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD ?? '')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/admin$/, { timeout: ADMIN_LOAD_TIMEOUT_MS })
    // Signed in: the header icon now leads straight back to the admin.
    await page.goto('/login')
    await expect(page).toHaveURL(/\/admin$/, { timeout: ADMIN_LOAD_TIMEOUT_MS })
  })
})
