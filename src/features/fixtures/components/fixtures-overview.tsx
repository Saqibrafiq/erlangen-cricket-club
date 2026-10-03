import { useTranslations } from 'next-intl'

import type { FixturesOverview as FixturesOverviewData } from '../types'
import { FilterableFixtures } from './filterable-fixtures'
import type { CompetitionOptionGroup } from './fixture-filters'
import { EmptyState } from './empty-state'
import { NextMatch } from './next-match'

export type FixturesOverviewProps = {
  overview: FixturesOverviewData
}

/** The next match (if any), then every fixture of every club team, filterable. */
export function FixturesOverview({ overview }: FixturesOverviewProps) {
  const t = useTranslations('fixtures')

  if (overview.fixtures.length === 0) {
    return <EmptyState>{t('empty')}</EmptyState>
  }

  const competitionGroups: CompetitionOptionGroup[] = overview.competitionsByTeam.map(
    ({ team, competitions }) => ({
      label: team.name,
      options: competitions.map((competition) => ({
        value: competition.slug,
        label: `${competition.name} ${competition.season}`,
      })),
    }),
  )

  // Fixtures come in display order (upcoming first), so the first scheduled one is the next match.
  const nextMatch = overview.fixtures.find((fixture) => fixture.status === 'scheduled')

  return (
    <div className="space-y-10">
      {nextMatch && <NextMatch fixture={nextMatch} />}
      <FilterableFixtures fixtures={overview.fixtures} competitionGroups={competitionGroups} />
    </div>
  )
}
