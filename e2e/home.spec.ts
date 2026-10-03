import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

test.describe('home page', () => {
  test('shows the club name as the only h1 in English by default', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Erlangen Cricket Club')
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page).toHaveTitle('Erlangen Cricket Club')
  })

  test('serves German under /de with hreflang alternates', async ({ page }) => {
    await page.goto('/de')

    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/de$/)
  })

  test('moves focus to the skip link first and jumps to main content', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skipLink).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.locator('main')).toBeFocused()
  })

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    await expectNoAxeViolations(page)

    await page.goto('/de')
    await expectNoAxeViolations(page)
  })
})

test('unknown routes return a localized 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('link', { name: 'Back to the home page' })).toBeVisible()
  await expectNoAxeViolations(page)
})
