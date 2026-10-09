import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { PLAYER, PLAYER_WITH_DETAILS, PLAYER_WITHOUT_PHOTO } from '../test-factories'
import { PlayerProfileView } from './player-profile-view'

function renderProfile(player = PLAYER_WITH_DETAILS, teammates = [PLAYER, PLAYER_WITHOUT_PHOTO]) {
  renderWithIntl(<PlayerProfileView player={player} teammates={teammates} playersHref="/players" />)
}

describe('PlayerProfileView', () => {
  it('names the player with office, role, teams and bio', () => {
    renderProfile()

    expect(screen.getByRole('heading', { level: 1, name: 'Jonas Becker' })).toBeVisible()
    const tags = within(screen.getAllByRole('list')[0] ?? document.body).getAllByRole('listitem')
    expect(tags.map((tag) => tag.textContent)).toEqual([
      'Treasurer',
      'All-rounder',
      'Erlangen Cricket Club I',
      'Erlangen Cricket Club II',
    ])
    expect(screen.getByText('Opening bowler and handy lower-order batter.')).toBeVisible()
  })

  it('lists the recorded playing details', () => {
    renderProfile()

    const details = within(screen.getByRole('region', { name: 'Playing profile' }))
    expect(details.getByText('Role').nextSibling).toHaveTextContent('All-rounder')
    expect(details.getByText('Batting').nextSibling).toHaveTextContent('Right-hand bat')
    expect(details.getByText('Bowling').nextSibling).toHaveTextContent('Right-arm medium')
  })

  it('leaves out playing details that are not recorded', () => {
    renderProfile(PLAYER)

    expect(screen.getByRole('img', { name: 'Sagar Suri in the club kit' })).toBeVisible()
    expect(screen.queryByRole('region', { name: 'Playing profile' })).toBeNull()
  })

  it('shows the career stats as not recorded yet', () => {
    renderProfile()

    const stats = within(screen.getByRole('region', { name: 'Career stats' }))
    expect(stats.getByText('Matches').nextSibling).toHaveTextContent('Not recorded yet')
    expect(stats.getAllByText('Not recorded yet')).toHaveLength(4)
    expect(stats.queryByRole('link')).toBeNull()
  })

  it('links to more players and the whole squad', () => {
    renderProfile()

    const more = within(screen.getByRole('region', { name: 'More players' }))
    expect(more.getByRole('link', { name: 'Sagar Suri' })).toHaveAttribute(
      'href',
      '/players/sagar-suri',
    )
    expect(more.getByRole('link', { name: 'All players' })).toHaveAttribute('href', '/players')
  })

  it('leaves out the more players section when the player is the only one', () => {
    renderProfile(PLAYER, [])

    expect(screen.queryByRole('region', { name: 'More players' })).toBeNull()
  })
})
