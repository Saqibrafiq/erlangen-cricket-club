import { act, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { HOME_DATA, MATCHDAY_BETWEEN_SEASONS } from '../test-factories'
import type { HomeData } from '../types'
import { HomeView } from './home-view'

// The features' public APIs also export their server queries, which load the Payload config (and
// validate server env vars) on import. The view itself never queries, so the config is stubbed.
vi.mock('@payload-config', () => ({ default: {} }))

const BETWEEN_SEASONS: HomeData = {
  ...HOME_DATA,
  matchday: MATCHDAY_BETWEEN_SEASONS,
  nextMatch: null,
}

function renderHome(data: HomeData = HOME_DATA) {
  renderWithIntl(<HomeView data={data} />)
}

function nextMatch() {
  return within(screen.getByRole('article', { name: 'Next match' }))
}

// The value (dd) that follows a term (dt) in the next match card.
function detail(term: string) {
  return nextMatch().getByText(term).closest('dt')?.nextElementSibling
}

function countdownValue(unit: string) {
  return nextMatch().getByText(unit).nextSibling
}

describe('HomeView', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(new Date('2027-05-12T06:29:15.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('introduces the club with one h1, how to join and training time', () => {
    renderHome()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Erlangen Cricket Club')
    expect(screen.getAllByRole('link', { name: /Join the club/ })[0]).toHaveAttribute(
      'href',
      '/membership',
    )
    expect(screen.getByText('Training Thursday 17:30–20:00')).toBeVisible()
  })

  it('shows the next match with teams, home game, date, kick-off and ground', () => {
    renderHome()

    const card = nextMatch()
    expect(card.getByText('BCV T20 Regionalliga Bayern')).toBeVisible()
    expect(card.getByText('Home game')).toBeVisible()
    expect(card.getByText('Erlangen Cricket Club I')).toBeVisible()
    expect(card.getByText('NCC-I')).toBeVisible()
    expect(detail('Kick-off')).toHaveTextContent('11:00')
    expect(detail('Ground')).toHaveTextContent('Erlangen Cricket Ground')
    expect(card.getByRole('link', { name: /Add to calendar/ })).toHaveAttribute(
      'href',
      '/calendar/fixture-100.ics',
    )
    expect(
      card.getByRole('link', { name: /^Directions to Erlangen Cricket Ground/ }),
    ).toHaveAttribute('target', '_blank')
  })

  it('counts down to kick-off, ticking every second', () => {
    renderHome()

    expect(countdownValue('days')).toHaveTextContent('03')
    expect(countdownValue('hours')).toHaveTextContent('02')
    expect(countdownValue('minutes')).toHaveTextContent('30')
    expect(countdownValue('seconds')).toHaveTextContent('45')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(countdownValue('seconds')).toHaveTextContent('44')
  })

  it('says it is match day once kick-off has passed', () => {
    vi.setSystemTime(new Date('2027-05-15T10:00:00.000Z'))
    renderHome()

    expect(nextMatch().getByText('Match day today!')).toBeVisible()
  })

  it('between seasons keeps the card with TBD and next season’s fixtures to come', () => {
    renderHome(BETWEEN_SEASONS)

    const card = nextMatch()
    expect(card.getByText('2027 fixtures coming soon')).toBeVisible()
    expect(card.getByText('Opponent TBA')).toBeVisible()
    expect(detail('Date')).toHaveTextContent('TBD')
    expect(countdownValue('days')).toHaveTextContent('––')
    expect(card.queryByRole('link', { name: /Add to calendar/ })).toBeNull()
    expect(card.getByRole('link', { name: 'Last season’s results' })).toHaveAttribute(
      'href',
      '/fixtures',
    )
  })

  it('tells the club’s titles in one statement and in the hero', () => {
    renderHome()

    const statement = within(screen.getByRole('region', { name: 'Our titles' }))
    expect(statement.getByText(/Bundesliga/)).toBeInTheDocument()
    expect(
      screen.getByText(/Seven-time champions and five-time T20 Regionalliga runners-up/),
    ).toBeVisible()
    expect(screen.getByText('7 titles')).toBeVisible()
    expect(screen.getByText('5× T20 runners-up')).toBeVisible()
  })

  it('shows the next match details as equal tiles: date, kick-off and ground', () => {
    renderHome()

    expect(detail('Date')).toHaveTextContent('Sat, May 15')
    expect(detail('Kick-off')).toHaveTextContent('11:00')
  })

  it('shows the season record on the scoreboard', () => {
    renderHome()

    const season = within(screen.getByRole('region', { name: 'Season 2027' }))
    expect(season.getByText('Played').nextSibling).toHaveTextContent('49')
    expect(season.getByText('Win rate').nextSibling).toHaveTextContent('57%')
  })

  it('lists the matches after the next one in a keyboard-scrollable rail', () => {
    renderHome()

    const rail = screen.getByRole('group', { name: 'Coming up' })
    expect(within(rail).getAllByRole('article')).toHaveLength(1)
    expect(rail).toHaveAttribute('tabindex', '0')
  })

  it('puts the squad before the tables and the tables before the results', () => {
    renderHome({ ...BETWEEN_SEASONS, standings: HOME_DATA.standings })

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)
    expect(headings.indexOf('Meet the squad')).toBeLessThan(headings.indexOf('Latest results'))
  })

  it('introduces the squad with links to each player and the whole squad', () => {
    renderHome()

    const squad = within(screen.getByRole('region', { name: 'Meet the squad' }))
    expect(squad.getByText(/12 players across 2 teams/)).toBeVisible()
    expect(squad.getByRole('link', { name: 'Saqib Rafiq' })).toHaveAttribute(
      'href',
      '/players/saqib-rafiq',
    )
    // Players without a photo are not part of the line-up.
    expect(squad.queryByRole('link', { name: 'Ullas' })).toBeNull()
    expect(squad.getByRole('link', { name: /All players/ })).toHaveAttribute('href', '/players')
  })

  it('shows the latest Instagram posts linking to Instagram', () => {
    renderHome()

    const instagram = within(screen.getByRole('region', { name: 'On Instagram' }))
    // Inside a scroll reveal, which never runs in jsdom: present, not yet faded in.
    expect(instagram.getByText('@er_cricketclub')).toBeInTheDocument()
    expect(instagram.getAllByRole('listitem')).toHaveLength(2)
    expect(instagram.getByRole('link', { name: /Matchday in Erlangen/ })).toHaveAttribute(
      'href',
      'https://www.instagram.com/p/abc/',
    )
    expect(instagram.getByRole('link', { name: /Follow us/ })).toHaveAttribute(
      'href',
      'https://www.instagram.com/er_cricketclub',
    )
  })

  it('links the sponsors to the sponsors page', () => {
    renderHome()

    expect(screen.getByRole('link', { name: 'mein-banker' })).toHaveAttribute('href', '/sponsors')
  })

  it('leaves out sections without content', () => {
    renderHome({
      ...BETWEEN_SEASONS,
      players: [],
      news: [],
      sponsors: [],
      instagram: null,
      training: null,
      matchday: {
        ...MATCHDAY_BETWEEN_SEASONS,
        recentResults: [],
        record: { ...MATCHDAY_BETWEEN_SEASONS.record, played: 0 },
      },
    })

    expect(screen.queryByRole('region', { name: 'Meet the squad' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Latest news' })).toBeNull()
    expect(screen.queryByRole('region', { name: /^Season/ })).toBeNull()
    expect(screen.queryByRole('region', { name: 'On Instagram' })).toBeNull()
    expect(screen.queryByText(/^Training/)).toBeNull()
  })
})
