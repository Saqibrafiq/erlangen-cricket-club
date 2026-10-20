import { usePathname } from '@/i18n/navigation'

/** Scrolls the page to the top: smoothly, or at once for people who prefer reduced motion. */
export function scrollToTop(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
}

/**
 * A click handler for links: on the page the link points to (e.g. the logo on the home page), the
 * router has nowhere to go, so it takes the visitor back to the top instead of doing nothing.
 */
export function useScrollToTopOnCurrentPage(href: string): () => void {
  const pathname = usePathname()
  return () => {
    if (pathname === href) {
      scrollToTop()
    }
  }
}
