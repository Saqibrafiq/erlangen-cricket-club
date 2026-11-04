import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'
import { ADMIN_EMAIL, ADMIN_PASSWORD, signIn } from './auth'

// Signing in loads the site in full; under `pnpm dev` the first load compiles for a while.
const PAGE_LOAD_TIMEOUT_MS = 60_000
const NAME = 'E2E Bakery'
// A 1 × 1 transparent PNG: enough for the media library to accept it.
const LOGO = {
  name: 'e2e-logo.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64',
  ),
}

test.describe('editing sponsors on the website', () => {
  // One test account: sign-ins one after another (see login.spec.ts).
  test.describe.configure({ mode: 'serial' })
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.')

  test('visitors see no editing controls', async ({ page }) => {
    await page.goto('/sponsors')

    await expect(page.getByRole('button', { name: 'Add sponsor' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^Edit / })).toHaveCount(0)
  })

  test('an editor adds, edits and deletes a sponsor', async ({ page }) => {
    test.setTimeout(4 * PAGE_LOAD_TIMEOUT_MS)
    await signIn(page)
    await page.goto('/sponsors')

    // Add, in both languages.
    await page.getByRole('button', { name: 'Add sponsor' }).click()
    const sheet = page.getByRole('dialog', { name: 'Add sponsor' })
    await sheet.getByLabel(/^Logo/).setInputFiles(LOGO)
    await sheet.getByLabel('Name').fill(NAME)
    await sheet.getByLabel('Description in English').fill('Fresh bread for every match day.')
    await sheet.getByLabel('Description in German').fill('Frisches Brot für jeden Spieltag.')
    await expectNoAxeViolations(page)
    await sheet.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByRole('status').filter({ hasText: `${NAME} saved.` })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    await expect(page.getByRole('heading', { level: 3, name: NAME })).toBeVisible()

    // The German page shows the German description.
    await page.goto('/de/sponsors')
    await expect(page.getByText('Frisches Brot für jeden Spieltag.')).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    // Back in English: the locale cookie from the German visit would otherwise keep German.
    await page.goto('/en/sponsors')

    // Edit: make it the title sponsor.
    await page.getByRole('button', { name: `Edit ${NAME}` }).click()
    const edit = page.getByRole('dialog', { name: 'Edit sponsor' })
    await expect(edit.getByLabel('Name')).toHaveValue(NAME)
    // The radio itself is visually hidden inside its card: pick the card, as an editor does.
    await edit.locator('label').filter({ hasText: 'Listed first and highlighted.' }).click()
    await expect(edit.getByRole('radio', { name: /Title sponsor/ })).toBeChecked()
    await edit.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('status').filter({ hasText: `${NAME} saved.` })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })

    // Delete, after confirming: the card dissolves, then it is gone.
    await page.getByRole('button', { name: `Delete ${NAME}` }).click()
    await page
      .getByRole('alertdialog', { name: `Remove ${NAME}?` })
      .getByRole('button', { name: 'Delete' })
      .click()
    await expect(page.getByRole('status').filter({ hasText: `${NAME} deleted.` })).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    await expect(page.getByRole('heading', { level: 3, name: NAME })).toHaveCount(0)
  })
})
