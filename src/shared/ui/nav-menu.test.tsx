import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { NavMenu, type NavigationGroup } from './nav-menu'

const pathname = vi.hoisted(() => ({ current: '/' }))

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePathname: () => pathname.current,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

const GROUPS: NavigationGroup[] = [
  { links: [{ href: '/fixtures', label: 'All fixtures & results' }] },
  {
    label: 'Erlangen Cricket Club I',
    links: [{ href: '/fixtures/dcb-bl-2026', label: 'DCB-Bundesliga Südost: Bayern 2026' }],
  },
]

function renderMenu() {
  return renderWithIntl(
    <>
      <NavMenu label="Fixtures & Results" href="/fixtures" groups={GROUPS} />
      <button type="button">Outside</button>
    </>,
  )
}

describe('NavMenu', () => {
  beforeEach(() => {
    pathname.current = '/'
  })

  it('is collapsed until the button is activated', async () => {
    const user = userEvent.setup()
    renderMenu()
    const button = screen.getByRole('button', { name: 'Fixtures & Results' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'All fixtures & results' })).toBeNull()

    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'All fixtures & results' })).toBeVisible()
  })

  it('labels each group of links by its heading', async () => {
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: 'Fixtures & Results' }))

    expect(screen.getByRole('list', { name: 'Erlangen Cricket Club I' })).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the button', async () => {
    const user = userEvent.setup()
    renderMenu()
    const button = screen.getByRole('button', { name: 'Fixtures & Results' })

    await user.click(button)
    await user.keyboard('{Escape}')

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('closes when clicking outside', async () => {
    const user = userEvent.setup()
    renderMenu()
    const button = screen.getByRole('button', { name: 'Fixtures & Results' })

    await user.click(button)
    await user.click(screen.getByRole('button', { name: 'Outside' }))

    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when keyboard focus moves past the last link', async () => {
    const user = userEvent.setup()
    renderMenu()
    const button = screen.getByRole('button', { name: 'Fixtures & Results' })

    await user.click(button)
    await user.tab() // All fixtures & results
    await user.tab() // DCB-Bundesliga Südost: Bayern 2026
    await user.tab() // Outside

    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when a link is followed', async () => {
    const user = userEvent.setup()
    renderMenu()
    const button = screen.getByRole('button', { name: 'Fixtures & Results' })

    await user.click(button)
    await user.click(screen.getByRole('link', { name: 'DCB-Bundesliga Südost: Bayern 2026' }))

    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks the current page link inside the menu', async () => {
    pathname.current = '/fixtures/dcb-bl-2026'
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: 'Fixtures & Results' }))

    expect(
      screen.getByRole('link', { name: 'DCB-Bundesliga Südost: Bayern 2026' }),
    ).toHaveAttribute('aria-current', 'page')
  })
})
