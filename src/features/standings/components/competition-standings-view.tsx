import { getClubStandings } from '../domain/get-club-standings'
import type { CompetitionStandings } from '../types'
import { ClubStandings } from './club-standings'
import { StandingsEmptyState } from './standings-empty-state'
import { StandingsLegend } from './standings-legend'
import { StandingsTable } from './standings-table'

export type CompetitionStandingsViewProps = {
  standings: CompetitionStandings
  /** Accessible name of the table, usually the competition's full title. */
  caption: string
}

/**
 * One competition: the club teams' places, then the published table with its legend — or an
 * empty state until the table is entered.
 */
export function CompetitionStandingsView({ standings, caption }: CompetitionStandingsViewProps) {
  if (standings.rows.length === 0) {
    return <StandingsEmptyState />
  }

  return (
    <div className="space-y-8">
      <ClubStandings entries={getClubStandings([standings])} />
      <div className="space-y-3">
        <StandingsTable rows={standings.rows} caption={caption} />
        <StandingsLegend />
      </div>
    </div>
  )
}
