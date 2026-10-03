import { useTranslations } from 'next-intl'

import type { CompetitionDetail } from '../types'
import { EmptyState } from './empty-state'
import { FilterableFixtures } from './filterable-fixtures'

export type CompetitionFixturesProps = {
  detail: CompetitionDetail
}

/**
 * One competition's fixtures, filterable by status and result, with the club's record for the
 * current selection. Sits below the page's h1.
 */
export function CompetitionFixtures({ detail }: CompetitionFixturesProps) {
  const t = useTranslations('fixtures')

  if (detail.fixtures.length === 0) {
    return <EmptyState>{t('empty')}</EmptyState>
  }

  return <FilterableFixtures fixtures={detail.fixtures} showCompetition={false} />
}
