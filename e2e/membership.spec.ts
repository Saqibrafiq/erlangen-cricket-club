import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'
import { openMainNavigation } from './navigation'

// Runs against the seeded membership page.
test.describe('membership', () => {
  test('is reachable from the header and shows fees and the week', async ({ page }) => {
    await page.goto('/')
    await (await openMainNavigation(page)).getByRole('link', { name: 'Membership' }).click()

    await expect(page).toHaveTitle('Membership | Erlangen Cricket Club')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Play cricket in Erlangen')

    const fees = page.getByRole('region', { name: 'Choose your membership' })
    await expect(fees.getByRole('heading', { level: 3 })).toHaveText([
      'Indoor',
      'Passive',
      'Active',
    ])
    await expect(fees).toContainText('+ €10 per tournament match')

    const schedule = page.getByRole('region', { name: 'When we play' })
    await expect(schedule).toContainText('Thursday')
    await expect(schedule).toContainText('17:30 – 20:00')
    await expect(schedule).toContainText('Saturday and Sunday')
  })

  test('leads to the joining steps and offers the application form as a PDF', async ({
    page,
    request,
  }) => {
    await page.goto('/membership')

    await page.getByRole('link', { name: 'Join as Active' }).click()
    await expect(page).toHaveURL(/#join$/)

    const form = page
      .getByRole('region', { name: 'Three steps to your first match' })
      .getByRole('link', { name: 'Application form (PDF)' })
    const response = await request.get((await form.getAttribute('href')) ?? '')
    expect(response.headers()['content-type']).toContain('application/pdf')
  })

  test('sends visitors to the contact page for directions to the ground', async ({ page }) => {
    await page.goto('/membership')

    await page.getByRole('link', { name: 'How to get to the ground' }).click()

    await expect(page).toHaveURL(/\/contact#ground$/)
    await expect(page.getByRole('region', { name: 'Our ground' })).toBeInViewport()
  })

  test('is available in German', async ({ page }) => {
    await page.goto('/de/membership')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cricket spielen in Erlangen')
    await expect(page.getByRole('region', { name: 'Wann wir spielen' })).toContainText('Donnerstag')
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    await page.goto('/membership')
    await expectNoAxeViolations(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expectNoAxeViolations(page)
  })
})
