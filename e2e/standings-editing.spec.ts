import { expect, type Page, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// The seed creates this account only when both variables are set (CI does; see seed-e2e-user.ts).
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
// Signing in loads the site in full; under `pnpm dev` the first load compiles for a while.
const PAGE_LOAD_TIMEOUT_MS = 60_000
const COMPETITION = 'E2E Cup'
const SEASON = '2099'
const NEW_TEAM = 'E2E-XI'
// The shape of CricClubs' "viewPointsTableExcel.csv", padding and all.
const CSV = {
  name: 'viewPointsTableExcel.csv',
  mimeType: 'text/csv',
  buffer: Buffer.from(
    [
      '',
      '  SNO ,TEAM , MAT, WON, LOST , N/R, TIE, PTS, WIN%,NET RR, FOR, AGAINST',
      '1,ECC-I,2,2,0,0,0,16.0,100.00%,1.5,320/40,260/40',
      `2,${NEW_TEAM},2,0,2,0,0,0.0,0.00%,-1.5,260/40,320/40`,
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

/** There is no delete on the website for competitions; the admin's REST API keeps reruns clean. */
async function removeTestData(page: Page): Promise<void> {
  await page.request.delete(
    `/api/competitions?where[name][equals]=${encodeURIComponent(COMPETITION)}`,
  )
  await page.request.delete(`/api/teams?where[shortName][equals]=${encodeURIComponent(NEW_TEAM)}`)
}

test.describe('importing standings on the website', () => {
  // One test account: sign-ins one after another (see login.spec.ts).
  test.describe.configure({ mode: 'serial' })
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.')

  test('visitors see no import controls', async ({ page }) => {
    await page.goto('/standings')

    await expect(page.getByRole('button', { name: 'Import table' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^Update table/ })).toHaveCount(0)
  })

  test('an editor starts a new season from a CricClubs export', async ({ page }) => {
    test.setTimeout(3 * PAGE_LOAD_TIMEOUT_MS)
    await signIn(page)
    await page.goto('/standings')

    try {
      await page.getByRole('button', { name: 'Import table' }).click()
      const sheet = page.getByRole('dialog', { name: 'Import table' })
      await sheet
        .getByLabel('Competition', { exact: true })
        .selectOption({ label: 'New competition…' })
      await sheet.getByLabel('Name', { exact: true }).fill(COMPETITION)
      await sheet.getByLabel('Season').fill(SEASON)
      await sheet.getByLabel(/^Points table \(CSV\)/).setInputFiles(CSV)

      // The preview: who is new, and the table as visitors will see it.
      await expect(sheet.getByText('New team')).toBeVisible()
      await expect(sheet.getByRole('table')).toContainText(NEW_TEAM)
      await expectNoAxeViolations(page)
      await sheet.getByRole('button', { name: 'Import table (2 teams)' }).click()

      await expect(
        page.getByRole('status').filter({
          hasText: `${COMPETITION} ${SEASON} updated: 2 teams, 1 new team added.`,
        }),
      ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS })
      const table = page.getByRole('table', { name: `${COMPETITION} ${SEASON}` })
      await expect(table).toContainText(NEW_TEAM)

      // The new season is now the current one; last season moved to its own page.
      await page.goto('/standings')
      await expect(page.getByRole('table', { name: `${COMPETITION} ${SEASON}` })).toBeVisible()
      await expect(page.getByRole('table', { name: /2026$/ })).toHaveCount(0)
      await page
        .getByRole('navigation', { name: 'Seasons' })
        .getByRole('link', { name: '2026' })
        .click()
      await expect(page).toHaveURL(/\/standings\/season\/2026$/, { timeout: PAGE_LOAD_TIMEOUT_MS })
      await expect(page.getByRole('heading', { level: 1, name: 'Standings 2026' })).toBeVisible()
      await expect(page.getByRole('table', { name: /2026$/ }).first()).toBeVisible()
    } finally {
      await removeTestData(page)
    }
  })
})
