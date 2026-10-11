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
})

test.describe('admin login with the test account', () => {
  // Payload keeps a user's sessions in a list on the user record: two sign-ins with the same
  // account at the same moment can overwrite each other's entry. So these run once (desktop)
  // and one after another; the editing specs sign in only after them (playwright.config.ts).
  test.describe.configure({ mode: 'serial' })
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.')
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'desktop', 'One test account: desktop only.')
  })

  test('signs an editor in to the website in edit mode, and out again', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL ?? '')
    await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD ?? '')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/$/, { timeout: ADMIN_LOAD_TIMEOUT_MS })
    await expect(page.getByText('Edit mode: you can add, edit and delete content')).toBeVisible()

    // Coming back to the login page while signed in offers edit mode instead of the form.
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1, name: 'You’re signed in' })).toBeVisible()
    await page.getByRole('button', { name: 'Open edit mode' }).click()
    await expect(page).toHaveURL(/\/$/, { timeout: ADMIN_LOAD_TIMEOUT_MS })

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page.getByText('Edit mode: you can add, edit and delete content')).toBeHidden({
      timeout: ADMIN_LOAD_TIMEOUT_MS,
    })
  })

  test('takes Payload admin pages back to where the editor was going', async ({ page }) => {
    test.setTimeout(2 * ADMIN_LOAD_TIMEOUT_MS)

    await page.goto('/admin/login?redirect=%2Fadmin')
    await page.getByLabel('Email').fill(ADMIN_EMAIL ?? '')
    await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD ?? '')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/admin$/, { timeout: ADMIN_LOAD_TIMEOUT_MS })
  })
})
