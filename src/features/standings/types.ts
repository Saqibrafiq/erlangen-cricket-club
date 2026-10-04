export type StandingsCompetition = {
  id: number
  slug: string
  name: string
  season: string
}

export type StandingsTeam = {
  id: number
  name: string
  shortName: string
  isClubTeam: boolean
}

/** One row as published by the league. Overs are in cricket notation ("243.4"). */
export type StandingsTableRow = {
  position: number
  team: StandingsTeam
  played: number
  won: number
  lost: number
  noResult: number
  tied: number
  points: number
  /** Percentage as published, e.g. 71.43. */
  winRate: number
  netRunRate: number
  runsFor: number
  oversFaced: string
  runsAgainst: number
  oversBowled: string
}

export type CompetitionStandings = {
  competition: StandingsCompetition
  /** Published order; empty until the league table is entered. */
  rows: readonly StandingsTableRow[]
}
