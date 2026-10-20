import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { HomeLink } from './home-link'
import { NavLink } from './nav-link'

const navigation = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

let prefersReducedMotion = false
const scrollTo = vi.fn()

beforeEach(() => {
  scrollTo.mockClear()
  vi.stubGlobal('scrollTo', scrollTo)
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: prefersReducedMotion })),
  )
})

// Re-stubbed before each test; unstubAllGlobals would also drop the setup's IntersectionObserver.
afterEach(() => {
  prefersReducedMotion = false
  navigation.pathname = '/'
})

describe('links to the page you are on', () => {
  it('take you back to the top smoothly from the crest on the home page', async () => {
    renderWithIntl(<HomeLink>Erlangen Cricket Club</HomeLink>)

    await userEvent.click(screen.getByRole('link', { name: 'Erlangen Cricket Club' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('jump to the top at once for people who prefer reduced motion', async () => {
    prefersReducedMotion = true
    renderWithIntl(<NavLink href="/">Home</NavLink>)

    await userEvent.click(screen.getByRole('link', { name: 'Home' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('leave scrolling to the router when they lead to another page', async () => {
    navigation.pathname = '/players'
    renderWithIntl(
      <>
        <HomeLink>Erlangen Cricket Club</HomeLink>
        <NavLink href="/news">News</NavLink>
      </>,
    )

    await userEvent.click(screen.getByRole('link', { name: 'Erlangen Cricket Club' }))
    await userEvent.click(screen.getByRole('link', { name: 'News' }))

    expect(scrollTo).not.toHaveBeenCalled()
  })
})
