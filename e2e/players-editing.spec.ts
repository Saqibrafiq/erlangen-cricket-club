import { expect, type Page, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// The seed creates this account only when both variables are set (CI does; see seed-e2e-user.ts).
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
// Signing in loads the site in full; under `pnpm dev` the first load compiles for a while.
const PAGE_LOAD_TIMEOUT_MS = 60_000

async function signIn(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL ?? '')
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD ?? '')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Edit mode: you can add, edit and delete content')).toBeVisible({
    timeout: PAGE_LOAD_TIMEOUT_MS,
  })
}

test.describe('editing players on the website', () => {
  // One test account: sign-ins one after another (see login.spec.ts).
  test.describe.configure({ mode: 'serial' })
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.')

  test('visitors see no editing controls', async ({ page }) => {
    await page.goto('/players')

    await expect(page.getByRole('heading', { level: 1, name: 'Our squad' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add player' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^Edit / })).toHaveCount(0)
  })

  test('an editor adds, edits and deletes a player', async ({ page }, testInfo) => {
    test.setTimeout(3 * PAGE_LOAD_TIMEOUT_MS)
    // Phone and desktop run in parallel against one database: each adds its own player.
    const name = `Test Bowler ${testInfo.project.name}`
    const renamed = `Test Spinner ${testInfo.project.name}`
    await signIn(page)
    await page.goto('/players')

    // Add: a fast bowler who agreed to be shown.
    await page.getByRole('button', { name: 'Add player' }).click()
    const addSheet = page.getByRole('dialog', { name: 'Add player' })
    await addSheet.getByLabel('Name', { exact: true }).fill(name)
    await addSheet.getByLabel('Role', { exact: true }).selectOption('bowler')
    await addSheet.getByLabel('Bowling style').selectOption('right-arm-fast')
    await addSheet.getByLabel('Agreed to appear on the website').check()
    await addSheet.getByLabel('How consent was given').fill('E2E test')
    await expectNoAxeViolations(page)
    await addSheet.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByRole('status').filter({ hasText: `${name} saved.` })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    const card = page
      .getByRole('listitem')
      .filter({ has: page.getByRole('button', { name: `Edit ${name}` }) })
    await expect(card).toContainText('Fast bowler')

    // Edit: rename and make them a spinner.
    await page.getByRole('button', { name: `Edit ${name}` }).click()
    const editSheet = page.getByRole('dialog', { name: 'Edit player' })
    await expect(editSheet.getByLabel('Name', { exact: true })).toHaveValue(name)
    await editSheet.getByLabel('Name', { exact: true }).fill(renamed)
    await editSheet.getByLabel('Bowling style').selectOption('right-arm-off-spin')
    await editSheet.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByRole('status').filter({ hasText: `${renamed} saved.` })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    await expect(page.getByRole('button', { name: `Edit ${renamed}` })).toBeVisible()
    await expect(page.getByRole('button', { name: `Edit ${name}` })).toHaveCount(0)

    // Delete, after confirming.
    await page.getByRole('button', { name: `Delete ${renamed}` }).click()
    const confirm = page.getByRole('alertdialog', { name: `Remove ${renamed}?` })
    await confirm.getByRole('button', { name: 'Delete' }).click()

    await expect(page.getByRole('status').filter({ hasText: `${renamed} deleted.` })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    await expect(page.getByRole('button', { name: `Edit ${renamed}` })).toHaveCount(0)
  })
})
