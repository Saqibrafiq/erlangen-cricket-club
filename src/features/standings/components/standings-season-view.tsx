import { useTranslations } from 'next-intl'

import { SeasonSwitcher } from '@/shared/ui/season-switcher'

import type { SeasonStandings } from '../domain/seasons'
import { getStandingsSeasonPath, STANDINGS_PATH } from '../paths'
import { StandingsOverview } from './standings-overview'

export type StandingsSeasonViewProps = {
  standings: SeasonStandings
}

/** One season's tables with links to the other seasons; the newest lives on /standings. */
export function StandingsSeasonView({ standings }: StandingsSeasonViewProps) {
  const t = useTranslations('standings')
  const [current] = standings.seasons

  return (
    <div className="space-y-8">
      {standings.season && (
        <SeasonSwitcher
          label={t('seasons')}
          seasons={standings.seasons}
          current={standings.season}
          hrefFor={(season) =>
            season === current ? STANDINGS_PATH : getStandingsSeasonPath(season)
          }
        />
      )}
      <StandingsOverview competitions={standings.tables} />
    </div>
  )
}
