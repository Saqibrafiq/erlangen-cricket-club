import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
/** How long the page must be free of running animations before axe measures it. */
const ANIMATION_QUIET_MS = 300

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
  // Quiet for a while, not just for an instant: a reveal can start a frame after a single check.
  await page.waitForFunction(
    (quietMs) => {
      const isRunning = document
        .getAnimations()
        .some(
          (animation) =>
            animation.playState === 'running' && animation.timeline instanceof DocumentTimeline,
        )
      const state = window as Window & { __axeQuietSince?: number }
      if (isRunning) {
        state.__axeQuietSince = undefined
        return false
      }
      state.__axeQuietSince ??= performance.now()
      return performance.now() - state.__axeQuietSince >= quietMs
    },
    ANIMATION_QUIET_MS,
    { polling: 50 },
  )
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

  expect(results.violations).toEqual([])
}
