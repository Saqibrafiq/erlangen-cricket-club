import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FLOAT_AFTER_PX } from '@/shared/lib/header-scroll'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { HeaderShell } from './header-shell'

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    fireEvent.scroll(window)
  })
}

afterEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})

describe('HeaderShell', () => {
  it('is the wide pill at the top and floats once the page scrolls', () => {
    renderWithIntl(
      <HeaderShell>
        <button type="button">Menu</button>
      </HeaderShell>,
    )
    const header = screen.getByRole('banner')
    expect(header).toHaveAttribute('data-floating', 'false')

    scrollTo(FLOAT_AFTER_PX + 10)
    expect(header).toHaveAttribute('data-floating', 'true')

    scrollTo(5000)
    expect(header).toHaveAttribute('data-floating', 'true')
    expect(screen.getByRole('button', { name: 'Menu' })).toBeVisible()

    scrollTo(0)
    expect(header).toHaveAttribute('data-floating', 'false')
  })
})
