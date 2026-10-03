import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { MAIN_CONTENT_ID, SkipLink } from './skip-link'

describe('SkipLink', () => {
  it('is the first element to receive keyboard focus', async () => {
    const user = userEvent.setup()
    render(
      <>
        <SkipLink>Skip to main content</SkipLink>
        <a href="#players">Players</a>
      </>,
    )

    await user.tab()

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus()
  })

  it('points at the main content landmark by default', () => {
    render(<SkipLink>Skip to main content</SkipLink>)

    expect(screen.getByRole('link')).toHaveAttribute('href', `#${MAIN_CONTENT_ID}`)
  })

  it('accepts a custom target', () => {
    render(<SkipLink targetId="scorecard">Skip to scorecard</SkipLink>)

    expect(screen.getByRole('link')).toHaveAttribute('href', '#scorecard')
  })
})
