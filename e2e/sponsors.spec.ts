import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'
import { openMainNavigation } from './navigation'

// Runs against the seeded sponsors (from the old website's announcements).
test.describe('sponsors', () => {
  test('is reachable from the footer and shows the title sponsor first', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Club' })
      .getByRole('link', { name: 'Sponsors' })
      .click()

    await expect(page).toHaveTitle('Sponsors | Erlangen Cricket Club')
    const sponsors = page.getByRole('article')
    await expect(sponsors).toHaveCount(4)
    await expect(sponsors.first()).toContainText('Title sponsor')
    // Title sponsor first, then by how long they have supported us.
    await expect(sponsors.getByRole('heading')).toHaveText([
      'mein-banker',
      'Delhi Erlangen',
      'Physio Kumar',
      'OVB Finanzberater Denis Martin',
    ])
  })

  test('is in the main navigation too', async ({ page }) => {
    await page.goto('/')
    await (await openMainNavigation(page)).getByRole('link', { name: 'Sponsors' }).click()

    await expect(page).toHaveURL(/\/sponsors$/)
  })

  test('links a sponsor to its announcement', async ({ page }) => {
    await page.goto('/sponsors')

    await page
      .getByRole('article')
      .first()
      .getByRole('link', { name: 'Read the announcement' })
      .click()

    await expect(page).toHaveURL(/\/news\/new-title-sponsor$/)
  })

  test('names the sponsors in structured data', async ({ page }) => {
    await page.goto('/sponsors')

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    const club = jsonLd
      .map((text) => JSON.parse(text) as { sponsor?: { name: string }[] })
      .find((data) => data.sponsor)
    expect(club?.sponsor?.map((sponsor) => sponsor.name)).toEqual([
      'mein-banker',
      'Delhi Erlangen',
      'Physio Kumar',
      'OVB Finanzberater Denis Martin',
    ])
  })

  test('is available in German', async ({ page }) => {
    await page.goto('/de/sponsors')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Danke an unsere Sponsoren')
    await expect(page.getByRole('article').first()).toContainText('Hauptsponsor')
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    await page.goto('/sponsors')
    await expectNoAxeViolations(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expectNoAxeViolations(page)
  })
})
