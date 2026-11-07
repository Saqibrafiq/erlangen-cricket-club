import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, vi } from 'vitest'

// jsdom has no IntersectionObserver; Motion's in-view effects need one. Everything counts as in
// view at once, so content that reveals on scroll (Reveal) is shown in tests like on screen.
class MockIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe = vi.fn((target: Element) => {
    this.callback(
      [{ isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  })
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

// Animations finish at once in tests: assertions see the end state, not a frame in between.
MotionGlobalConfig.skipAnimations = true

// jsdom has no ResizeObserver either (used to measure the pinned hero); nothing ever resizes.
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
vi.stubGlobal('ResizeObserver', MockResizeObserver)

// jsdom has no matchMedia (the theme follows prefers-color-scheme): a light-mode device by default.
// Assigned, not stubbed, so tests that stub their own and then unstub get this one back.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }) satisfies MediaQueryList

afterEach(() => {
  cleanup()
})
