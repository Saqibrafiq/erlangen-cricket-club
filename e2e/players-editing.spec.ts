import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'
import { ADMIN_EMAIL, ADMIN_PASSWORD, signIn } from './auth'

// Signing in loads the site in full; under `pnpm dev` the first load compiles for a while.
const PAGE_LOAD_TIMEOUT_MS = 60_000

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

  test('an editor adds, edits and deletes a season on a profile', async ({ page }, testInfo) => {
    test.setTimeout(3 * PAGE_LOAD_TIMEOUT_MS)
    // Phone and desktop run in parallel on one player: each adds its own (old) season.
    const season = testInfo.project.name === 'mobile' ? '2018' : '2019'
    const label = `${season} · Club · All matches`
    await signIn(page)
    await page.goto('/players/jimmy-joshi')
    const stats = page.getByRole('region', { name: 'Career stats' })

    // Add: batting and bowling for one season.
    await stats.getByRole('button', { name: 'Add season' }).click()
    const addSheet = page.getByRole('dialog', { name: 'Add a season' })
    await addSheet.getByLabel('Season', { exact: true }).fill(season)
    const batting = addSheet.getByRole('group', { name: 'Batting' })
    await batting.getByLabel('Matches').fill('10')
    await batting.getByLabel('Innings').fill('9')
    await batting.getByLabel('Not outs').fill('1')
    await batting.getByLabel('Runs', { exact: true }).fill('240')
    await batting.getByLabel('Balls faced').fill('200')
    await batting.getByLabel('Highest score', { exact: true }).fill('64')
    const bowling = addSheet.getByRole('group', { name: 'Bowling' })
    await bowling.getByLabel('Matches').fill('10')
    await bowling.getByLabel('Overs').fill('30.3')
    await bowling.getByLabel('Runs conceded').fill('183')
    await bowling.getByLabel('Wickets', { exact: true }).fill('12')
    await expectNoAxeViolations(page)
    await addSheet.getByRole('button', { name: 'Save season' }).click()

    await expect(
      page.getByRole('status').filter({ hasText: `Season ${season} saved` }),
    ).toBeVisible({
      timeout: PAGE_LOAD_TIMEOUT_MS,
    })
    const battingTable = stats.getByRole('region', { name: 'Batting' })
    // 240 runs over 8 dismissals = 30.00; 240 from 200 balls = 120.00.
    const battingRow = battingTable.getByRole('row').filter({ hasText: season })
    await expect(battingRow).toContainText('30.00')
    await expect(battingRow).toContainText('120.00')
    // 183 runs from 30.3 overs (183 balls) = 6.00 an over.
    await expect(
      stats.getByRole('region', { name: 'Bowling' }).getByRole('row').filter({ hasText: season }),
    ).toContainText('6.00')
    await expectNoAxeViolations(page)

    // Edit: more runs.
    await battingTable.getByRole('button', { name: `Edit season ${label}` }).click()
    const editSheet = page.getByRole('dialog', { name: 'Edit season' })
    const editBatting = editSheet.getByRole('group', { name: 'Batting' })
    await expect(editBatting.getByLabel('Runs', { exact: true })).toHaveValue('240')
    await editBatting.getByLabel('Runs', { exact: true }).fill('320')
    await editSheet.getByRole('button', { name: 'Save season' }).click()
    await expect(battingRow).toContainText('40.00', { timeout: PAGE_LOAD_TIMEOUT_MS })

    // Delete, after confirming.
    await battingTable.getByRole('button', { name: `Delete season ${label}` }).click()
    const confirm = page.getByRole('alertdialog', { name: `Delete season ${label}?` })
    await confirm.getByRole('button', { name: 'Delete season' }).click()
    await expect(
      page.getByRole('status').filter({ hasText: `Season ${label} deleted` }),
    ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS })
    await expect(stats.getByRole('row').filter({ hasText: season })).toHaveCount(0)
  })
})
