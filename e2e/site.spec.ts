import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

test.describe('site chrome', () => {
  test('switches language and keeps the current page', async ({ page }) => {
    await page.goto('/fixtures')

    await page
      .getByRole('navigation', { name: 'Language' })
      .getByRole('link', { name: /Deutsch/ })
      .click()

    await expect(page).toHaveURL(/\/de\/fixtures$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Spielplan & Ergebnisse')
  })

  test('links to the legal pages from the footer on every page', async ({ page }) => {
    await page.goto('/')

    const legal = page.getByRole('contentinfo').getByRole('navigation', { name: 'Legal' })
    await legal.getByRole('link', { name: 'Legal notice' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Legal notice (Impressum)')

    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy policy' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy policy')
  })

  test('shows a notice while the legal text has not been written', async ({ page }) => {
    await page.goto('/de/impressum')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Impressum')
    await expect(page.getByText(/wird gerade vorbereitet/)).toBeVisible()
  })

  test('keeps the header visible while scrolling on larger screens', async ({ page, isMobile }) => {
    test.skip(isMobile, 'On phones the header scrolls away to free up the screen.')
    await page.goto('/fixtures')
    await page.mouse.wheel(0, 2000)

    await expect(page.getByRole('banner')).toBeInViewport()
  })

  test('legal pages have no accessibility violations', async ({ page }) => {
    await page.goto('/impressum')
    await expectNoAxeViolations(page)
  })
})
