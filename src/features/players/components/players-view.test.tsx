import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { createSquad, PLAYER, PLAYER_WITH_DETAILS, PLAYER_WITHOUT_PHOTO } from '../test-factories'
import { PlayersView, type SquadFacts } from './players-view'

const FACTS: SquadFacts = { season: '2026', clubTeams: 2, competitions: 4 }

function renderView(
  players = [PLAYER, PLAYER_WITH_DETAILS, PLAYER_WITHOUT_PHOTO],
  facts: SquadFacts | null = FACTS,
) {
  renderWithIntl(<PlayersView players={players} joinHref="/membership" facts={facts} />)
}

function squad() {
  return within(screen.getByRole('region', { name: 'The squad' }))
}

describe('PlayersView', () => {
  it('titles the page with the season and the club’s numbers', () => {
    renderView()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Our squad')
    expect(screen.getByText('Season 2026')).toBeVisible()
    expect(screen.getByText('Players').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Teams').nextSibling).toHaveTextContent('2')
    expect(screen.getByText('Competitions').nextSibling).toHaveTextContent('4')
  })

  it('shows only the player count before the season has fixtures', () => {
    renderView(undefined, null)

    expect(screen.queryByText('Season 2026')).toBeNull()
    expect(screen.queryByText('Teams')).toBeNull()
    expect(screen.getByText('Players')).toBeVisible()
  })

  it('links every player to their profile, with office or role below the name', () => {
    renderView()

    expect(squad().getByRole('link', { name: 'Sagar Suri' })).toHaveAttribute(
      'href',
      '/players/sagar-suri',
    )
    const [, treasurer, batter] = squad().getAllByRole('article')
    expect(treasurer).toHaveTextContent('Treasurer')
    expect(batter).toHaveTextContent('Batter')
    expect(squad().getByText('3 players')).toBeVisible()
  })

  it('ends the squad with an invitation to join', () => {
    renderView()

    expect(squad().getByRole('link', { name: 'Join the squad' })).toHaveAttribute(
      'href',
      '/membership',
    )
  })

  it('finds players by name and offers a way back when nobody matches', async () => {
    const user = userEvent.setup()
    renderView()
    const search = screen.getByRole('searchbox', { name: 'Find a player' })

    await user.type(search, 'becker')
    expect(squad().getAllByRole('article')).toHaveLength(1)
    expect(squad().getByRole('status')).toHaveTextContent('1 of 3')

    await user.clear(search)
    await user.type(search, 'xyz')
    expect(squad().getByText('No players match your search.')).toBeVisible()

    await user.click(squad().getByRole('button', { name: 'Show all players' }))
    expect(squad().getAllByRole('article')).toHaveLength(4)
  })

  it('filters a full squad by team and role, and clears all filters at once', async () => {
    const user = userEvent.setup()
    renderView(createSquad(45))

    const teams = screen.getByRole('group', { name: 'Team' })
    await user.click(within(teams).getByText('Erlangen Cricket Club I'))
    expect(squad().getByRole('status')).toHaveTextContent('23 of 45')

    const roles = screen.getByRole('group', { name: 'Role' })
    // In the fictional squad every batter plays for the first team.
    await user.click(within(roles).getByText('Batters'))
    expect(squad().getAllByRole('article')).toHaveLength(12)
    expect(squad().queryByRole('link', { name: 'Join the squad' })).toBeNull()

    await user.type(screen.getByRole('searchbox', { name: 'Find a player' }), 'nobody')
    await user.click(squad().getByRole('button', { name: 'Show all players' }))
    expect(squad().getByRole('status')).toHaveTextContent('45 players')
    expect(within(roles).getByRole('radio', { name: 'All (45)' })).toBeChecked()
  })

  it('shows the team and role filters only once editors have assigned them', () => {
    renderView([PLAYER, { ...PLAYER, id: 9, slug: 'arun', name: 'Arun' }])

    expect(screen.queryByRole('group', { name: 'Team' })).toBeNull()
    expect(screen.queryByRole('group', { name: 'Role' })).toBeNull()
  })

  it('says the squad is coming soon when no player has agreed yet', () => {
    renderView([])

    expect(screen.getByText('Our squad will be introduced here soon.')).toBeVisible()
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(squad().getByRole('link', { name: 'Join the squad' })).toBeVisible()
  })
})
