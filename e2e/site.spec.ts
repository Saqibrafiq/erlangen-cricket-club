import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'
import { openMainNavigation } from './navigation'

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

  test('keeps the slim header visible while scrolling', async ({ page }) => {
    await page.goto('/fixtures')
    await page.mouse.wheel(0, 2000)

    await expect(page.getByRole('banner')).toBeInViewport()
  })

  test('phone menu closes with Escape and returns focus to its button', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Desktop shows the navigation in the header.')
    await page.goto('/')

    await openMainNavigation(page)
    await page.keyboard.press('Escape')

    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused()
  })

  test('phone menu has no accessibility violations', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Desktop shows the navigation in the header.')
    await page.goto('/news')

    const navigation = await openMainNavigation(page)
    await expect(navigation.getByRole('link', { name: 'News' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expectNoAxeViolations(page)
  })

  test('legal pages have no accessibility violations', async ({ page }) => {
    await page.goto('/impressum')
    await expectNoAxeViolations(page)
  })
})
