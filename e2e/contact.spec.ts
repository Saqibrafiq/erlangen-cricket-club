import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'

// Runs against the seeded contact page.
test.describe('contact', () => {
  test('is reachable from the header and shows email and the ground', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Contact' })
      .click()

    await expect(page).toHaveTitle('Contact us | Erlangen Cricket Club')
    await expect(page.getByRole('link', { name: 'erlangencricketclub@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:erlangencricketclub@gmail.com',
    )
    await expect(page.getByRole('region', { name: 'Our ground' })).toContainText('Siedlerstraße 1')
  })

  test('loads the OpenStreetMap map only after the visitor asks for it', async ({ page }) => {
    const mapRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('openstreetmap.org')) mapRequests.push(request.url())
    })
    // Keep the test independent of the network: answer the map provider with an empty page.
    await page.route('https://www.openstreetmap.org/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<html></html>' }),
    )
    await page.goto('/contact')

    const ground = page.getByRole('region', { name: 'Our ground' })
    await expect(ground.locator('iframe')).toHaveCount(0)
    expect(mapRequests).toEqual([])

    await expect(async () => {
      await ground.getByRole('button', { name: 'Show map' }).click()
      await expect(ground.locator('iframe')).toHaveCount(1, { timeout: 1000 })
    }).toPass()
    await expect(ground.locator('iframe')).toHaveAttribute(
      'title',
      'Map of Erlangen Cricket Ground',
    )
  })

  test('explains what is missing when the form is sent empty', async ({ page }) => {
    await page.goto('/contact')

    // Retry until hydrated: before that, the button would post the form without JavaScript.
    await expect(async () => {
      await page.getByRole('button', { name: 'Send message' }).click()
      // Scoped to the form: Next.js adds its own (empty) role="alert" route announcer.
      await expect(page.locator('form').getByRole('alert')).toHaveText(
        'Please check the highlighted fields.',
        { timeout: 1000 },
      )
    }).toPass()
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused()
  })

  test('sends a message and confirms it', async ({ page }) => {
    await page.goto('/contact')

    await page.getByRole('textbox', { name: 'Name' }).fill('Playwright Test')
    await page.getByRole('textbox', { name: 'Email' }).fill('playwright@example.com')
    await page
      .getByRole('combobox', { name: 'What is it about?' })
      .selectOption({ label: 'Membership' })
    await page.getByRole('textbox', { name: 'Message' }).fill('I would like to join the club.')
    await page.getByRole('button', { name: 'Send message' }).click()

    await expect(page.getByRole('heading', { name: 'Thank you!' })).toBeFocused()
  })

  test('is available in German', async ({ page }) => {
    await page.goto('/de/contact')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kontakt')
    await expect(page.getByRole('button', { name: 'Nachricht senden' })).toBeVisible()
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    await page.goto('/contact')
    await expectNoAxeViolations(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expectNoAxeViolations(page)
  })
})
