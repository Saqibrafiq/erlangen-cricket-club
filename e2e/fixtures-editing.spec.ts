import { expect, type Page, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// The seed creates this account only when both variables are set (CI does; see seed-e2e-user.ts).
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
// Signing in loads the site in full; under `pnpm dev` the first load compiles for a while.
const PAGE_LOAD_TIMEOUT_MS = 60_000
const COMPETITION = 'E2E Fixtures Cup'
const SEASON = '2099'
const NEW_TEAM = 'E2E-XII'
const GROUND = 'E2E Ground'
const CSV = {
  name: 'fixtures-2099.csv',
  mimeType: 'text/csv',
  buffer: Buffer.from(
    [
      'Date,Time,Home,Away,Ground,Address,Stage',
      `16.05.2099,11:00,ECC-I,${NEW_TEAM},${GROUND},"Teststraße 1, 91056 Erlangen",League`,
      `23.05.2099,,${NEW_TEAM},ECC-I,${GROUND},,`,
    ].join('\n'),
  ),
}

async function signIn(page: Page): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL ?? '')
  await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD ?? '')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Edit mode: you can add, edit and delete content')).toBeVisible({
    timeout: PAGE_LOAD_TIMEOUT_MS,
  })
}

/** There is no delete on the website for these; the admin's REST API keeps reruns clean. */
async function removeTestData(page: Page): Promise<void> {
  const response = await page.request.get(
    `/api/competitions?where[name][equals]=${encodeURIComponent(COMPETITION)}&depth=0`,
  )
  const { docs } = (await response.json()) as { docs: { id: number }[] }
  for (const { id } of docs) {
    await page.request.delete(`/api/fixtures?where[competition][equals]=${String(id)}`)
    await page.request.delete(`/api/competitions/${String(id)}`)
  }
  await page.request.delete(`/api/teams?where[shortName][equals]=${encodeURIComponent(NEW_TEAM)}`)
  await page.request.delete(`/api/grounds?where[name][equals]=${encodeURIComponent(GROUND)}`)
}

test.describe('importing fixtures on the website', () => {
  // One test account: sign-ins one after another (see login.spec.ts).
  test.describe.configure({ mode: 'serial' })
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.')

  test('visitors see no import controls', async ({ page }) => {
    await page.goto('/fixtures')

    await expect(page.getByRole('button', { name: 'Import fixtures' })).toHaveCount(0)
  })

  test('an editor imports the next season from a CSV', async ({ page }) => {
    test.setTimeout(3 * PAGE_LOAD_TIMEOUT_MS)
    await signIn(page)
    await page.goto('/fixtures')

    try {
      await page.getByRole('button', { name: 'Import fixtures' }).click()
      const sheet = page.getByRole('dialog', { name: 'Import fixtures' })
      await sheet
        .getByLabel('Competition', { exact: true })
        .selectOption({ label: 'New competition…' })
      await sheet.getByLabel('Name', { exact: true }).fill(COMPETITION)
      await sheet.getByLabel('Season').fill(SEASON)
      await sheet.getByLabel(/^Schedule \(CSV\)/).setInputFiles(CSV)

      await expect(sheet.getByText('2 new · 0 changed · 0 removed')).toBeVisible()
      await expect(sheet.getByText(`New teams: ${NEW_TEAM}.`, { exact: false })).toBeVisible()
      await expectNoAxeViolations(page)
      await sheet.getByRole('button', { name: 'Import 2 fixtures' }).click()

      await expect(
        page.getByRole('status').filter({ hasText: `${COMPETITION} ${SEASON}: 2 new` }),
      ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS })

      // Edit one fixture: a later start.
      await page.getByRole('button', { name: `Edit ECC-I v ${NEW_TEAM}` }).click()
      const edit = page.getByRole('dialog', { name: `Edit ECC-I v ${NEW_TEAM}` })
      await expect(edit.getByLabel('Date')).toHaveValue('2099-05-16')
      await edit.getByLabel(/^Start time/).fill('14:30')
      await expectNoAxeViolations(page)
      await edit.getByRole('button', { name: 'Save' }).click()
      await expect(
        page.getByRole('status').filter({ hasText: `ECC-I v ${NEW_TEAM} saved.` }),
      ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS })

      // Delete the other, after confirming: it dissolves, then it is gone.
      await page.getByRole('button', { name: `Delete ${NEW_TEAM} v ECC-I` }).click()
      await page
        .getByRole('alertdialog', { name: `Delete ${NEW_TEAM} v ECC-I?` })
        .getByRole('button', { name: 'Delete' })
        .click()
      await expect(
        page.getByRole('status').filter({ hasText: `${NEW_TEAM} v ECC-I deleted.` }),
      ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS })
      await expect(page.getByRole('button', { name: `Edit ${NEW_TEAM} v ECC-I` })).toHaveCount(0)

      // The new season is the current one: its fixtures, with the ground, and last season archived.
      await page.goto('/fixtures')
      await expect(page.getByText(GROUND).first()).toBeVisible()
      await page
        .getByRole('navigation', { name: 'Seasons' })
        .getByRole('link', { name: '2026' })
        .click()
      await expect(page).toHaveURL(/\/fixtures\/season\/2026$/, { timeout: PAGE_LOAD_TIMEOUT_MS })
      await expect(
        page.getByRole('heading', { level: 1, name: 'Fixtures & Results 2026' }),
      ).toBeVisible()
    } finally {
      await removeTestData(page)
    }
  })
})
