import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom has no IntersectionObserver; Motion's in-view effects need one. Nothing ever scrolls into
// view in tests, so revealed content keeps its initial state: assert presence, not visibility.
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

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
