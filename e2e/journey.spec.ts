import { expect, test } from '@playwright/test'

import { expectNoAxeViolations } from './a11y'
import { openMainNavigation } from './navigation'

// Runs against the seeded journey page (story and milestones from the old website).
test.describe('journey', () => {
  test('is reachable from the header and tells the story from 2010 to today', async ({ page }) => {
    await page.goto('/')
    await (await openMainNavigation(page)).getByRole('link', { name: 'Journey' }).click()

    await expect(page).toHaveTitle('Our journey | Erlangen Cricket Club')
    await expect(page.getByRole('region', { name: 'Who we are' })).toContainText(
      'Our journey began in 2010',
    )
    const milestones = page.getByRole('region', { name: 'From 2010 to today' }).getByRole('article')
    await expect(milestones).toHaveCount(11)
    await expect(milestones.first()).toContainText('The first players sign up')
    await expect(milestones.last()).toContainText('Two teams, four competitions')
  })

  test('links a milestone to its news article', async ({ page }) => {
    await page.goto('/journey')

    await page
      .getByRole('article')
      .filter({ hasText: 'Bundesliga champions again' })
      .getByRole('link', { name: 'Read more' })
      .click()

    await expect(page).toHaveURL(/\/news\/the-triumph-of-resilience-eccs-journey-in-2023$/)
  })

  test('is available in German', async ({ page }) => {
    await page.goto('/de/journey')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Von den ersten Spielern bis in Bayerns höchste Ligen',
    )
    await expect(page.getByRole('region', { name: 'Von 2010 bis heute' })).toContainText(
      'Die ersten Spieler melden sich an',
    )
  })

  test('has no accessibility violations in light and dark mode', async ({ page }) => {
    await page.goto('/journey')
    await expectNoAxeViolations(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload()
    await expectNoAxeViolations(page)
  })
})
