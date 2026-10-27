import type { ImportedStandingsRow } from './standings-csv'

export type StandingsRowChange = {
  position: number
  teamShortName: string
  /** Places gained (positive) or lost (negative); `null` if the team wasn't in the table. */
  positionChange: number | null
  /** Points added since the current table; `null` if the team wasn't in the table. */
  pointsChange: number | null
  matchesAdded: number | null
  /** Not one of our teams yet: the import adds it. */
  isNewTeam: boolean
}

export type StandingsDiff = {
  rows: StandingsRowChange[]
  /** Teams in the current table that the new one no longer lists. */
  removedTeams: string[]
  /** Nothing would change. */
  isUnchanged: boolean
}

const STAT_FIELDS = [
  'played',
  'won',
  'lost',
  'noResult',
  'tied',
  'points',
  'winRate',
  'netRunRate',
  'runsFor',
  'oversFaced',
  'runsAgainst',
  'oversBowled',
] as const satisfies readonly (keyof ImportedStandingsRow)[]

/**
 * Compares an imported points table with the current one, so editors see what an import changes
 * before confirming it: moves, points and matches added, teams new to the club's records.
 *
 * @param current - Today's table in published order (empty before the first import).
 * @param knownTeams - Short names of all teams we already have.
 */
export function diffStandings(
  current: readonly ImportedStandingsRow[],
  imported: readonly ImportedStandingsRow[],
  knownTeams: ReadonlySet<string>,
): StandingsDiff {
  const before = new Map(current.map((row, index) => [row.teamShortName, { row, index }]))

  const rows = imported.map((row, index): StandingsRowChange => {
    const previous = before.get(row.teamShortName)
    return {
      position: index + 1,
      teamShortName: row.teamShortName,
      positionChange: previous ? previous.index - index : null,
      pointsChange: previous ? row.points - previous.row.points : null,
      matchesAdded: previous ? row.played - previous.row.played : null,
      isNewTeam: !knownTeams.has(row.teamShortName),
    }
  })
  const importedTeams = new Set(imported.map((row) => row.teamShortName))
  const removedTeams = current
    .map((row) => row.teamShortName)
    .filter((team) => !importedTeams.has(team))

  const isUnchanged =
    current.length === imported.length &&
    imported.every((row, index) => {
      const previous = current[index]
      return (
        previous?.teamShortName === row.teamShortName &&
        STAT_FIELDS.every((field) => previous[field] === row[field])
      )
    })

  return { rows, removedTeams, isUnchanged }
}
