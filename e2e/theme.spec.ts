import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

const THEMES = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'ECC', value: 'ecc' },
] as const

test.describe('themes', () => {
  test('follows the device by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

    await page.emulateMedia({ colorScheme: 'light' })
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  for (const { label, value } of THEMES) {
    test(`switches to ${label}, keeps it after a reload and passes axe`, async ({ page }) => {
      await page.goto('/standings')

      await page.getByRole('button', { name: /^Theme:/ }).click()
      await page.getByRole('menuitemradio', { name: label }).click()

      const html = page.locator('html')
      await expect(html).toHaveAttribute('data-theme', value)
      await expect(page.getByRole('button', { name: `Theme: ${label}` })).toBeVisible()

      // Applied before the first paint on the next load, without a flash of another theme.
      await page.reload()
      await expect(html).toHaveAttribute('data-theme', value)
      // axe checks colour contrast on the real page, so each palette is verified in the browser.
      await expectNoAxeViolations(page)
    })
  }
})
