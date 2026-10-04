import { getStandingsPath } from '../paths'
import type { CompetitionStandings, StandingsTableRow } from '../types'

export type ClubStandingEntry = {
  key: string
  row: StandingsTableRow
  teamCount: number
  competition?: { title: string; href: string }
}

export type ClubStandingsOptions = {
  /** Name and link each entry's competition (overview pages listing several tables). */
  withCompetition?: boolean
}

/** The club teams' rows of the given tables, grouped by team (first team first), ready for cards. */
export function getClubStandings(
  tables: readonly CompetitionStandings[],
  { withCompetition = false }: ClubStandingsOptions = {},
): ClubStandingEntry[] {
  const entries = tables.flatMap(({ competition, rows }) =>
    rows
      .filter((row) => row.team.isClubTeam)
      .map((row) => ({
        key: `${competition.id}-${row.team.id}`,
        row,
        teamCount: rows.length,
        ...(withCompetition && {
          competition: {
            title: `${competition.name} ${competition.season}`,
            href: getStandingsPath(competition.slug),
          },
        }),
      })),
  )

  // Stable sort: within a team, competitions keep the order given.
  return entries.toSorted((a, b) => a.row.team.name.localeCompare(b.row.team.name))
}
