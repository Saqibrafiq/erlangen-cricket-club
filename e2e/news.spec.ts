import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'
import { openMainNavigation } from './navigation'

// Runs against the seeded data: articles migrated from the old website, newest first.
const SPONSOR = {
  path: '/news/new-sponsor-ovb-finanzberater-denis-martin',
  title: 'Erlangen Cricket Club Welcomes New Sponsor: OVB Finanzberater Denis Martin',
}
const AGM = {
  path: '/news/annual-general-meeting-2024-key-takeaways',
  title:
    'Cricket Passion Shines Through: Key Takeaways from Erlangen Cricket Club’s Annual General Meeting 2024',
}

test.describe('news', () => {
  test('lists articles newest first and opens one from the header', async ({ page }) => {
    await page.goto('/')
    await (await openMainNavigation(page)).getByRole('link', { name: 'News' }).click()

    await expect(page).toHaveTitle('News | Erlangen Cricket Club')
    // Seeded: the 2 recent articles plus 22 migrated from the old website.
    const headings = page.getByRole('heading', { level: 2 })
    await expect(headings).toHaveCount(24)
    await expect(headings.nth(0)).toHaveText(SPONSOR.title)
    await expect(headings.nth(1)).toHaveText(AGM.title)

    await page.getByRole('link', { name: SPONSOR.title }).click()

    await expect(page).toHaveURL(new RegExp(`${SPONSOR.path}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(SPONSOR.title)
  })

  test('shows the sponsor logo after the heading and links to the sponsor', async ({ page }) => {
    await page.goto(SPONSOR.path)

    await expect(page.getByRole('img', { name: 'OVB logo' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'his official profile' })).toHaveAttribute(
      'href',
      'https://www.ovb.de/finanzberater/nuernberg-martin-denis.html',
    )
    await expect(
      (await openMainNavigation(page)).getByRole('link', { name: 'News' }),
    ).toHaveAttribute('aria-current', 'true')
  })

  test('shows the AGM photos and the new office bearers', async ({ page }) => {
    await page.goto(AGM.path)

    await expect(page).toHaveTitle(`${AGM.title} | Erlangen Cricket Club`)
    await expect(page.getByRole('region', { name: 'Photos' }).getByRole('img')).toHaveCount(6)
    await expect(
      page.getByRole('listitem').filter({ hasText: 'President – Sagar Suri' }),
    ).toBeVisible()
  })

  test('publishes NewsArticle structured data', async ({ page }) => {
    await page.goto(AGM.path)

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    const article = jsonLd
      .map((text) => JSON.parse(text) as { '@type'?: string })
      .find((data) => data['@type'] === 'NewsArticle')
    expect(article).toMatchObject({
      headline: AGM.title,
      datePublished: '2024-12-19T12:00:00.000Z',
    })
  })

  test('is available in German', async ({ page }) => {
    await page.goto('/de/news')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Neuigkeiten')
    await expect(page.getByText('12. Juni 2025')).toBeVisible()
  })

  test('returns 404 for an unknown article', async ({ page }) => {
    const response = await page.goto('/news/no-such-article')

    expect(response?.status()).toBe(404)
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    for (const path of ['/news', AGM.path]) {
      await page.goto(path)
      await expectNoAxeViolations(page)
    }

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(SPONSOR.path)
    await expectNoAxeViolations(page)
  })
})
