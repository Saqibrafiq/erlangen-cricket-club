import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useMockSearchParams } from '@/shared/testing/mock-search-params'
import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { ECC_TEAM, makeCompletedFixture, makeScheduledFixture } from '../test-factories'
import type { CompetitionDetail } from '../types'
import { CompetitionFixtures } from './competition-fixtures'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useSearchParams: () => useMockSearchParams(),
}))

const DETAIL: CompetitionDetail = {
  competition: {
    id: 1,
    slug: 'bcv-t20-regionalliga-bayern-2026',
    name: 'BCV T20 Regionalliga Bayern',
    season: '2026',
    isFeatured: false,
  },
  clubTeams: [ECC_TEAM],
  record: { played: 1, won: 0, lost: 1, tied: 0, noResult: 0 },
  fixtures: [makeScheduledFixture({ id: 1 }), makeCompletedFixture({ id: 2 })],
}

describe('CompetitionFixtures', () => {
  it('shows the record for the selection and every fixture without repeating the competition', () => {
    renderWithIntl(<CompetitionFixtures detail={DETAIL} />)

    expect(screen.getByLabelText('Club record')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.queryByText(/BCV T20 Regionalliga Bayern 2026 ·/)).toBeNull()
  })

  it('filters by status only — the competition is fixed', () => {
    renderWithIntl(<CompetitionFixtures detail={DETAIL} />)

    expect(screen.queryByRole('combobox', { name: 'Competition' })).toBeNull()
    expect(screen.getByRole('radio', { name: 'Completed (1)' })).toBeInTheDocument()
  })

  it('shows an empty state before the first fixture', () => {
    renderWithIntl(
      <CompetitionFixtures
        detail={{
          ...DETAIL,
          fixtures: [],
          record: { played: 0, won: 0, lost: 0, tied: 0, noResult: 0 },
        }}
      />,
    )

    expect(screen.getByText(/No fixtures yet/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Club record/)).toBeNull()
  })
})
