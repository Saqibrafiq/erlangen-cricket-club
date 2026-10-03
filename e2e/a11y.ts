import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/**
 * Fails the test on any WCAG 2.2 AA violation on the current page. Waits for running CSS
 * animations first: mid-fade elements are partly transparent and would report false contrast
 * failures.
 */
export async function expectNoAxeViolations(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== 'running'),
  )
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

  expect(results.violations).toEqual([])
}
