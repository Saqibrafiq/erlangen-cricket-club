import { expect, type Page, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// Runs against the seeded 2026 results (`pnpm db:seed`).
const T20 = {
  path: '/fixtures/bcv-t20-regionalliga-bayern-2026',
  title: 'BCV T20 Regionalliga Bayern 2026',
}
const BUNDESLIGA = {
  path: '/fixtures/dcb-bundesliga-suedost-bayern-2026',
  title: 'DCB-Bundesliga Südost: Bayern 2026',
}
const REGIONALLIGA = {
  path: '/fixtures/bcv-regionalliga-bayern-2026',
  title: 'BCV Regionalliga Bayern 2026',
}
const VERBANDSLIGA = {
  path: '/fixtures/bcv-t20-1-verbandsliga-2026',
  title: 'BCV T20 1. Verbandsliga 2026',
}

function fixturesMenuButton(page: Page) {
  return page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('button', { name: 'Fixtures & Results' })
}

test.describe('fixtures navigation', () => {
  test('opens a competition from the header dropdown, grouped by team', async ({ page }) => {
    await page.goto('/')

    await fixturesMenuButton(page).click()
    await page
      .getByRole('list', { name: 'Erlangen Cricket Club II' })
      .getByRole('link', { name: REGIONALLIGA.title })
      .click()

    await expect(page).toHaveURL(new RegExp(`${REGIONALLIGA.path}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(REGIONALLIGA.title)
    await expect(fixturesMenuButton(page)).toHaveAttribute('aria-expanded', 'false')
  })

  test('closes the dropdown with Escape and returns focus', async ({ page }) => {
    await page.goto('/')

    await fixturesMenuButton(page).click()
    await expect(page.getByRole('link', { name: 'All fixtures & results' })).toBeVisible()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('link', { name: 'All fixtures & results' })).toBeHidden()
    await expect(fixturesMenuButton(page)).toBeFocused()
  })

  test('has no accessibility violations with the dropdown open', async ({ page }) => {
    await page.goto('/')
    await fixturesMenuButton(page).click()

    await expectNoAxeViolations(page)
  })
})

test.describe('all fixtures', () => {
  test('lists every fixture of all four competitions together', async ({ page }) => {
    await page.goto('/fixtures')

    await expect(page).toHaveTitle('Fixtures & Results | Erlangen Cricket Club')
    await expect(page.getByRole('article')).toHaveCount(49)
    await expect(page.getByRole('status')).toHaveText('49 fixtures')
    await expect(page.locator('label', { hasText: 'Forfeit (5)' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Walkover (2)' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Completed (42)' })).toBeVisible()
  })

  test('filters by competition and status, keeping filters in the URL', async ({ page }) => {
    await page.goto('/fixtures')

    // The pre-hydration fallback renders an identical (inert) select, so retry until the
    // hydrated filter has taken the choice.
    await expect(async () => {
      await page
        .getByRole('combobox', { name: 'Competition' })
        .selectOption({ label: VERBANDSLIGA.title })
      await expect(page.getByRole('article')).toHaveCount(16, { timeout: 1000 })
    }).toPass()

    // Visitors click the visible pill (the label); the native radio is visually hidden.
    await page.locator('label', { hasText: 'Walkover (2)' }).click()
    await expect(page.getByRole('article')).toHaveCount(2)
    await expect(page.getByText('AUXCC won by walkover').first()).toBeVisible()
    await expect(page).toHaveURL(/\?competition=bcv-t20-1-verbandsliga-2026&status=walkover$/)

    await page.reload()
    await expect(page.getByRole('article')).toHaveCount(2)
    await expect(page.getByRole('radio', { name: 'Walkover (2)' })).toBeChecked()
  })

  test('filters by won and lost, combined with status', async ({ page }) => {
    await page.goto('/fixtures')

    await expect(page.locator('label', { hasText: 'Won (27)' })).toBeVisible()
    await expect(page.locator('label', { hasText: 'Lost (20)' })).toBeVisible()

    // Visitors click the visible pill (the label); the native radio is visually hidden.
    await page.locator('label', { hasText: 'Lost (20)' }).click()
    await expect(page.getByRole('article')).toHaveCount(20)

    await page.locator('label', { hasText: 'Forfeit (3)' }).click()
    await expect(page.getByRole('article')).toHaveCount(3)
    await expect(page).toHaveURL(/\?status=forfeit&result=lost$/)
  })

  test('offers a way out of an empty filter result', async ({ page }) => {
    await page.goto('/fixtures?status=upcoming')

    await expect(page.getByText('No fixtures match these filters.')).toBeVisible()
    await page.getByRole('button', { name: 'Clear filters' }).click()

    await expect(page.getByRole('article')).toHaveCount(49)
    await expect(page).toHaveURL(/\/fixtures$/)
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    await page.goto('/fixtures')
    await expectNoAxeViolations(page)

    // Reload after switching so axe does not measure colours mid-transition.
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expectNoAxeViolations(page)
  })
})

test.describe('competition pages', () => {
  test('T20: derived margins and record', async ({ page }) => {
    await page.goto(T20.path)

    await expect(page).toHaveTitle(`${T20.title} | Erlangen Cricket Club`)
    const results = page.getByRole('main')
    await expect(results.getByRole('article')).toHaveCount(16)
    await expect(results.getByText('NCC-I won by 32 runs')).toBeVisible()
    await expect(results.getByText('CCB-II won by 51 runs (DLS)')).toBeVisible()

    const record = page.getByLabel('Club record')
    await expect(record).toContainText('Played16')
    await expect(record).toContainText('Won10')
    await expect(record).toContainText('Lost4')
    await expect(record).toContainText('Tied2')
  })

  test('Bundesliga: forfeits without play', async ({ page }) => {
    await page.goto(BUNDESLIGA.path)

    const results = page.getByRole('main')
    await expect(results.getByRole('article')).toHaveCount(9)
    await expect(results.getByText('NCC-I won by 4 wickets')).toBeVisible()
    await expect(results.getByText('DWCC awarded the match (forfeit)')).toBeVisible()
    await expect(page.getByLabel('Club record')).toContainText('Won5')
  })

  test('Regionalliga: ECC-II results', async ({ page }) => {
    await page.goto(REGIONALLIGA.path)

    const results = page.getByRole('main')
    await expect(results.getByRole('article')).toHaveCount(8)
    await expect(results.getByText('INRS won by 190 runs')).toBeVisible()
    const record = page.getByLabel('Club record')
    await expect(record).toContainText('Played8')
    await expect(record).toContainText('Won5')
    await expect(record).toContainText('Lost3')
  })

  test('Verbandsliga: ECC-II forfeits and walkovers, filtered by status', async ({ page }) => {
    await page.goto(VERBANDSLIGA.path)

    await expect(page.getByRole('combobox', { name: 'Competition' })).toHaveCount(0)
    const record = page.getByLabel('Club record')
    await expect(record).toContainText('Played16')
    await expect(record).toContainText('Won7')
    await expect(record).toContainText('Lost9')

    // Visitors click the visible pill (the label); the native radio is visually hidden.
    await page.locator('label', { hasText: 'Forfeit (2)' }).click()
    await expect(page.getByRole('article')).toHaveCount(2)
    await expect(
      page.getByText('Erlangen Cricket Club II awarded the match (forfeit)').first(),
    ).toBeVisible()
  })

  test('links back to the overview through breadcrumbs', async ({ page }) => {
    await page.goto(BUNDESLIGA.path)

    await page
      .getByRole('navigation', { name: 'Breadcrumb' })
      .getByRole('link', { name: 'Fixtures & Results' })
      .click()

    await expect(page).toHaveURL(/\/fixtures$/)
  })

  test('is available in German', async ({ page }) => {
    await page.goto(`/de${T20.path}`)

    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
    await expect(page.getByText('NCC-I gewann mit 32 Runs')).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/de${T20.path}$`),
    )
  })

  test('publishes SportsEvent and BreadcrumbList structured data', async ({ page }) => {
    await page.goto(T20.path)

    const documents = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).map((json) => JSON.parse(json) as { '@type'?: string; '@graph'?: { '@type': string }[] })
    const events = documents.flatMap((document) => document['@graph'] ?? [])

    expect(events).toHaveLength(16)
    expect(events.every((event) => event['@type'] === 'SportsEvent')).toBe(true)
    expect(documents.some((document) => document['@type'] === 'BreadcrumbList')).toBe(true)
  })

  test('returns 404 for an unknown competition', async ({ page }) => {
    const response = await page.goto('/fixtures/no-such-competition')

    expect(response?.status()).toBe(404)
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    await page.goto(BUNDESLIGA.path)
    await expectNoAxeViolations(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expectNoAxeViolations(page)
  })
})
