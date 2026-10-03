import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Test stand-in for next/navigation's useSearchParams. Next.js re-renders on
 * window.history.replaceState; jsdom has no router, so `installHistoryListener` patches
 * replaceState to notify subscribers the same way.
 */
export function useMockSearchParams(): URLSearchParams {
  const search = useSyncExternalStore(subscribe, () => window.location.search)
  return new URLSearchParams(search)
}

export function installHistoryListener(): () => void {
  const original = window.history.replaceState.bind(window.history)

  window.history.replaceState = (...args: Parameters<History['replaceState']>) => {
    original(...args)
    listeners.forEach((listener) => {
      listener()
    })
  }

  return () => {
    window.history.replaceState = original
  }
}
