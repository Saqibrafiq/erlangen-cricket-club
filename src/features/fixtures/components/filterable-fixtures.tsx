import { Suspense } from 'react'

import { getFixtureCategory } from '../domain/fixture-filters'
import type { FixtureSummary } from '../types'
import { FixtureCard } from './fixture-card'
import {
  FixtureFilters,
  FixtureFiltersStatic,
  type CompetitionOptionGroup,
  type FilterableFixture,
} from './fixture-filters'

export type FilterableFixturesProps = {
  fixtures: readonly FixtureSummary[]
  competitionGroups?: readonly CompetitionOptionGroup[]
  showCompetition?: boolean
}

/**
 * Server wrapper: renders every card on the server, then hands them to the client-side filters.
 * useSearchParams opts the filters out of static rendering, so the static HTML (crawlers,
 * no-JS visitors) is the fallback: the same layout with the unfiltered list.
 */
export function FilterableFixtures({
  fixtures,
  competitionGroups,
  showCompetition = true,
}: FilterableFixturesProps) {
  const items: FilterableFixture[] = fixtures.map((fixture) => ({
    id: fixture.id,
    date: fixture.date,
    competition: fixture.competition.slug,
    category: getFixtureCategory(fixture),
    outcome: fixture.clubOutcome,
    card: <FixtureCard fixture={fixture} showCompetition={showCompetition} />,
  }))

  return (
    <Suspense
      fallback={<FixtureFiltersStatic items={items} competitionGroups={competitionGroups} />}
    >
      <FixtureFilters items={items} competitionGroups={competitionGroups} />
    </Suspense>
  )
}
