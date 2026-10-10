import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { installHistoryListener, useMockSearchParams } from '@/shared/testing/mock-search-params'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { ECC_TEAM, makeCompletedFixture, makeScheduledFixture, NCC_TEAM } from '../test-factories'
import type { FixturesOverview as FixturesOverviewData } from '../types'
import { FixturesOverview } from './fixtures-overview'
import { FixturesSkeleton } from './fixtures-skeleton'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useSearchParams: () => useMockSearchParams(),
}))

const T20 = {
  id: 1,
  slug: 't20-2026',
  name: 'BCV T20 Regionalliga Bayern',
  season: '2026',
  isFeatured: false,
}
const BUNDESLIGA = {
  id: 2,
  slug: 'bl-2026',
  name: 'DCB-Bundesliga Südost: Bayern',
  season: '2026',
  isFeatured: false,
}

const OVERVIEW: FixturesOverviewData = {
  fixtures: [
    makeScheduledFixture({ id: 1, competition: T20 }),
    makeCompletedFixture({ id: 2, competition: T20 }),
    makeCompletedFixture({
      id: 3,
      competition: BUNDESLIGA,
      innings: [],
      result: { kind: 'forfeit', winnerTeamId: NCC_TEAM.id },
    }),
    makeCompletedFixture({
      id: 4,
      competition: BUNDESLIGA,
      innings: [],
      result: { kind: 'walkover', winnerTeamId: ECC_TEAM.id },
    }),
  ],
  competitionsByTeam: [{ team: ECC_TEAM, competitions: [T20, BUNDESLIGA] }],
}

function articleCount() {
  return screen.queryAllByRole('article').length
}

describe('FixturesOverview', () => {
  let restoreHistory: () => void

  beforeEach(() => {
    window.history.replaceState(null, '', '/fixtures')
    restoreHistory = installHistoryListener()
  })

  afterEach(() => {
    restoreHistory()
  })

  it('lists every fixture of every competition in one list', () => {
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    expect(articleCount()).toBe(4)
    expect(screen.getByRole('status')).toHaveTextContent('4 fixtures')
  })

  it('offers competitions grouped by team', () => {
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    const select = screen.getByRole('combobox', { name: 'Competition' })
    expect(
      within(select).getByRole('group', { name: 'Erlangen Cricket Club I' }),
    ).toBeInTheDocument()
    expect(
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual([
      'All competitions',
      'BCV T20 Regionalliga Bayern 2026',
      'DCB-Bundesliga Südost: Bayern 2026',
    ])
  })

  it('filters by competition, updates the URL and recounts statuses', async () => {
    const user = userEvent.setup()
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Competition' }), 'bl-2026')

    expect(window.location.search).toBe('?competition=bl-2026')
    expect(articleCount()).toBe(2)
    expect(screen.getByRole('radio', { name: 'Forfeit (1)' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Upcoming (0)' })).toBeInTheDocument()
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    await user.click(screen.getByRole('radio', { name: 'Walkover (1)' }))

    expect(window.location.search).toBe('?status=walkover')
    expect(articleCount()).toBe(1)
    expect(screen.getByText('Erlangen Cricket Club I won by walkover')).toBeInTheDocument()
  })

  it('filters by club result', async () => {
    const user = userEvent.setup()
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    await user.click(screen.getByRole('radio', { name: 'Won (1)' }))

    expect(window.location.search).toBe('?result=won')
    expect(articleCount()).toBe(1)
    expect(screen.getByText('Erlangen Cricket Club I won by walkover')).toBeInTheDocument()
  })

  it('combines status and result, with counts reflecting the other filters', () => {
    window.history.replaceState(null, '', '/fixtures?status=forfeit&result=lost')
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    expect(articleCount()).toBe(1)
    expect(screen.getByText('NCC-I awarded the match (forfeit)')).toBeInTheDocument()
    // Result counts within forfeits; status counts within losses.
    expect(screen.getByRole('radio', { name: 'Won (0)' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Completed (1)' })).toBeInTheDocument()
  })

  it('restores filters from the URL', () => {
    window.history.replaceState(null, '', '/fixtures?status=upcoming')
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    expect(screen.getByRole('radio', { name: 'Upcoming (1)' })).toBeChecked()
    expect(articleCount()).toBe(1)
  })

  it('shows an empty state with a way to clear the filters', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/fixtures?competition=bl-2026&status=upcoming')
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    expect(screen.getByText('No fixtures match these filters.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(window.location.search).toBe('')
    expect(articleCount()).toBe(4)
  })

  it('highlights the next scheduled match', () => {
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    const nextMatch = screen.getByRole('region', { name: 'Next match' })
    expect(within(nextMatch).getByText('Saturday, May 15, 2027')).toBeInTheDocument()
    expect(within(nextMatch).getByText('Erlangen Cricket Ground')).toBeInTheDocument()
  })

  it('groups fixtures under month headings', () => {
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(['Next match', 'May 2027', 'September 2026'])
  })

  it('summarises the club record with a win rate', () => {
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    const record = screen.getByLabelText('Club record')
    expect(within(record).getByText('Played').nextElementSibling).toHaveTextContent('3')
    expect(within(record).getByText('Win rate').nextElementSibling).toHaveTextContent('33%')
  })

  it('lists active filters as removable chips', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/fixtures?status=forfeit&result=lost')
    renderWithIntl(<FixturesOverview overview={OVERVIEW} />)

    const chips = screen.getByRole('list', { name: 'Active filters' })
    expect(within(chips).getAllByRole('button')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Remove filter: Result: Lost' }))

    expect(window.location.search).toBe('?status=forfeit')
  })

  it('shows an empty state when there are no fixtures at all', () => {
    renderWithIntl(<FixturesOverview overview={{ fixtures: [], competitionsByTeam: [] }} />)

    expect(screen.getByText(/No fixtures yet/)).toBeInTheDocument()
    expect(screen.queryByRole('search')).toBeNull()
  })
})

describe('FixturesSkeleton', () => {
  it('announces loading', () => {
    renderWithIntl(<FixturesSkeleton />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })
})
