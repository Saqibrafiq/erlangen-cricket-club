import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { PLAYER_WITH_DETAILS, PLAYER_WITHOUT_PHOTO } from '../test-factories'
import { PlayerCard } from './player-card'

describe('PlayerCard', () => {
  it('shows a board member’s playing role and board office, on a card set apart', () => {
    renderWithIntl(<PlayerCard player={PLAYER_WITH_DETAILS} />)

    expect(screen.getByText('All-rounder')).toBeVisible()
    expect(screen.getByText('Treasurer')).toBeVisible()
    expect(screen.getByRole('article')).toHaveClass('ring-2')
  })

  it('shows only the playing role for a member without an office', () => {
    renderWithIntl(<PlayerCard player={PLAYER_WITHOUT_PHOTO} />)

    expect(screen.getByText('Batter')).toBeVisible()
    expect(screen.queryByText('Treasurer')).toBeNull()
    expect(screen.getByRole('article')).not.toHaveClass('ring-2')
  })

  it('opens the profile from the whole card', () => {
    renderWithIntl(<PlayerCard player={PLAYER_WITHOUT_PHOTO} />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/players/${PLAYER_WITHOUT_PHOTO.slug}`,
    )
  })
})
