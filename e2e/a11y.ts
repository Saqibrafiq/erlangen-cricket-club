import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/**
 * Fails the test on any WCAG 2.2 AA violation on the current page.
 *
 * Measures with reduced motion: fade-ins start after hydration, so an element caught mid-fade is
 * partly transparent and reports false contrast failures — a race that waiting alone cannot close.
 * Under reduced motion our CSS and Motion skip to the final state, which is what axe should check.
 * Scroll-linked animations follow the scroll position and never finish, so they are not waited for.
 */
export async function expectNoAxeViolations(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState !== 'running' || !(animation.timeline instanceof DocumentTimeline),
      ),
  )
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

  expect(results.violations).toEqual([])
}
