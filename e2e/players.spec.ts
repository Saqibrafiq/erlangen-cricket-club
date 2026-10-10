import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'
import { openMainNavigation } from './navigation'

// Runs against the seeded squad: 12 players, all with recorded consent.
const PLAYER = { path: '/players/sagar-suri', name: 'Sagar Suri' }

test.describe('players', () => {
  test('lists the squad by name from the main navigation', async ({ page }) => {
    await page.goto('/')
    await (await openMainNavigation(page)).getByRole('link', { name: 'Players' }).click()

    await expect(page).toHaveTitle('Players | Erlangen Cricket Club')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our squad')
    const squad = page.getByRole('region', { name: 'The squad' })
    await expect(squad.getByRole('status')).toHaveText('12 players')
    // 12 players by name, then the open spot inviting visitors to join.
    const names = squad.getByRole('heading', { level: 3 })
    await expect(names).toHaveCount(13)
    await expect(names.first()).toHaveText('Akmal Sandhu')
    await expect(names.nth(11)).toHaveText('Ullas')
    await expect(squad.getByRole('link', { name: 'Join the squad' })).toHaveAttribute(
      'href',
      '/membership',
    )
  })

  test('finds a player by name', async ({ page }) => {
    await page.goto('/players')
    const squad = page.getByRole('region', { name: 'The squad' })

    // Retry until hydrated: before that, typing does not filter.
    await expect(async () => {
      await squad.getByRole('searchbox', { name: 'Find a player' }).fill('kumar')
      await expect(squad.getByRole('article')).toHaveCount(1, { timeout: 1000 })
    }).toPass()
    await expect(squad.getByRole('status')).toHaveText('1 of 12')
    await squad.getByRole('link', { name: 'Sunny Kumar' }).click()

    await expect(page).toHaveURL(/\/players\/sunny-kumar$/)
  })

  test('opens a profile with photo, stats placeholder and more players', async ({ page }) => {
    await page.goto('/players')
    await page
      .getByRole('region', { name: 'The squad' })
      .getByRole('link', { name: PLAYER.name })
      .click()

    await expect(page).toHaveURL(new RegExp(`${PLAYER.path}$`))
    await expect(page).toHaveTitle(`${PLAYER.name} | Erlangen Cricket Club`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(PLAYER.name)
    await expect(page.getByRole('img', { name: 'Sagar Suri in the club kit' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Career stats' })).toBeVisible()
    // The next players in the squad, wrapping around.
    await expect(
      page.getByRole('region', { name: 'More players' }).getByRole('heading', { level: 3 }),
    ).toHaveText(['Saqib Rafiq', 'Sunny Kumar', 'Tarang', 'Ullas'])
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Players' }),
    ).toHaveAttribute('href', '/players')
  })

  test('publishes Person and BreadcrumbList structured data on a profile', async ({ page }) => {
    await page.goto(PLAYER.path)

    const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
      (json) => (JSON.parse(json) as { '@type'?: string })['@type'],
    )
    expect(types).toEqual(expect.arrayContaining(['Person', 'BreadcrumbList']))
  })

  test('is available in German', async ({ page }) => {
    await page.goto(`/de${PLAYER.path}`)

    await expect(page.getByRole('heading', { level: 2, name: 'Weitere Spieler' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Karrierestatistik' })).toBeVisible()
  })

  test('returns 404 for an unknown player', async ({ page }) => {
    const response = await page.goto('/players/no-such-player')

    expect(response?.status()).toBe(404)
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    for (const path of ['/players', PLAYER.path]) {
      await page.goto(path)
      await expectNoAxeViolations(page)
    }

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(PLAYER.path)
    await expectNoAxeViolations(page)
  })
})
