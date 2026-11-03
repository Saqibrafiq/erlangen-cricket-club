import { useTranslations } from 'next-intl'

import { SeasonSwitcher } from '@/shared/ui/season-switcher'

import { FIXTURES_PATH, getFixturesSeasonPath } from '../domain/paths'
import type { FixturesSeason } from '../types'
import { FixturesOverview } from './fixtures-overview'

export type FixturesSeasonViewProps = {
  overview: FixturesSeason
}

/** One season's fixtures with links to the other seasons; the newest lives on /fixtures. */
export function FixturesSeasonView({ overview }: FixturesSeasonViewProps) {
  const t = useTranslations('fixtures')
  const [current] = overview.seasons

  return (
    <div className="space-y-8">
      {overview.season && (
        <SeasonSwitcher
          label={t('seasons')}
          seasons={overview.seasons}
          current={overview.season}
          hrefFor={(season) => (season === current ? FIXTURES_PATH : getFixturesSeasonPath(season))}
        />
      )}
      <FixturesOverview overview={overview} />
    </div>
  )
}
