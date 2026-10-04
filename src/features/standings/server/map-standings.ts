import type { Competition } from '@/payload-types'

import type { CompetitionStandings, StandingsTableRow } from '../types'

type StoredRow = NonNullable<Competition['standings']>[number]

/** Thrown when standings were queried without populated teams (programming error). */
export class StandingsMappingError extends Error {
  override name = 'StandingsMappingError'
}

function mapRow(row: StoredRow, index: number, competitionId: number): StandingsTableRow {
  const { team } = row

  if (typeof team !== 'object') {
    throw new StandingsMappingError(
      `Competition ${competitionId}: standings team must be populated (query with depth >= 1)`,
    )
  }

  return {
    position: index + 1,
    team: {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      isClubTeam: team.isClubTeam ?? false,
    },
    played: row.played,
    won: row.won,
    lost: row.lost,
    noResult: row.noResult,
    tied: row.tied,
    points: row.points,
    winRate: row.winRate,
    netRunRate: row.netRunRate,
    runsFor: row.runsFor,
    oversFaced: row.oversFaced,
    runsAgainst: row.runsAgainst,
    oversBowled: row.oversBowled,
  }
}

/** Maps a competition (queried with depth >= 1) to its published table; row order is position. */
export function mapStandings(competition: Competition): CompetitionStandings {
  return {
    competition: {
      id: competition.id,
      slug: competition.slug,
      name: competition.name,
      season: competition.season,
    },
    rows: (competition.standings ?? []).map((row, index) => mapRow(row, index, competition.id)),
  }
}
