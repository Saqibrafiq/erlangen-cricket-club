import { isValidOvers } from '@/domain/cricket'
import { normalizeCsvHeader, parseCsv } from '@/shared/lib/csv'

/** One team's line of a CricClubs points table export ("viewPointsTableExcel.csv"). */
export type ImportedStandingsRow = {
  /** CricClubs' team code, matched against our teams' short names, e.g. "ECC-I". */
  teamShortName: string
  played: number
  won: number
  lost: number
  noResult: number
  tied: number
  points: number
  winRate: number
  netRunRate: number
  runsFor: number
  oversFaced: string
  runsAgainst: number
  oversBowled: string
}

type ImportedField = keyof ImportedStandingsRow

export type StandingsCsvErrorCode =
  | 'empty'
  | 'tooLarge'
  | 'missingColumn'
  | 'noRows'
  | 'missingTeam'
  | 'duplicateTeam'
  | 'notCount'
  | 'notNumber'
  | 'notRunsOvers'

export type StandingsCsvError = {
  code: StandingsCsvErrorCode
  /** Line in the file, when the problem is in one row. */
  line?: number
  /** The column as CricClubs names it, e.g. "NET RR". */
  column?: string
  /** The offending cell or team, as written. */
  value?: string
}

export type StandingsCsvResult =
  { success: true; rows: ImportedStandingsRow[] } | { success: false; errors: StandingsCsvError[] }

/** A points table is a few hundred bytes; anything far larger is the wrong file. */
export const STANDINGS_CSV_MAX_BYTES = 100 * 1024

const TEAM_COLUMN = 'TEAM'
const COUNT_COLUMNS = {
  played: 'MAT',
  won: 'WON',
  lost: 'LOST',
  noResult: 'N/R',
  tied: 'TIE',
  points: 'PTS',
} as const satisfies Partial<Record<ImportedField, string>>
const WIN_RATE_COLUMN = 'WIN%'
const NET_RUN_RATE_COLUMN = 'NET RR'
const FOR_COLUMN = 'FOR'
const AGAINST_COLUMN = 'AGAINST'
const REQUIRED_COLUMNS = [
  TEAM_COLUMN,
  ...Object.values(COUNT_COLUMNS),
  WIN_RATE_COLUMN,
  NET_RUN_RATE_COLUMN,
  FOR_COLUMN,
  AGAINST_COLUMN,
]

const COUNT_PATTERN = /^\d+(?:\.0+)?$/
const NUMBER_PATTERN = /^[+-]?\d+(?:\.\d+)?$/
const PERCENT_SIGN = '%'
const RUNS_OVERS_SEPARATOR = '/'

type CellReader = (column: string) => string

function readCount(cell: string): number | null {
  return COUNT_PATTERN.test(cell) ? Number(cell) : null
}

function readNumber(cell: string): number | null {
  return NUMBER_PATTERN.test(cell) ? Number(cell) : null
}

/** "2185/243.4" → runs and overs. */
function readRunsOvers(cell: string): { runs: number; overs: string } | null {
  const [runs = '', overs = '', ...rest] = cell.split(RUNS_OVERS_SEPARATOR).map((s) => s.trim())
  const runCount = readCount(runs)
  if (rest.length > 0 || runCount === null || !isValidOvers(overs)) {
    return null
  }
  return { runs: runCount, overs }
}

function readRow(
  read: CellReader,
  line: number,
  errors: StandingsCsvError[],
): ImportedStandingsRow | null {
  const errorCount = errors.length
  const fail = (code: StandingsCsvErrorCode, column: string) => {
    errors.push({ code, line, column, value: read(column) })
  }

  const teamShortName = read(TEAM_COLUMN)
  if (!teamShortName) fail('missingTeam', TEAM_COLUMN)

  const counts: Partial<Record<keyof typeof COUNT_COLUMNS, number>> = {}
  for (const [field, column] of Object.entries(COUNT_COLUMNS) as [
    keyof typeof COUNT_COLUMNS,
    string,
  ][]) {
    const value = readCount(read(column))
    if (value === null) fail('notCount', column)
    else counts[field] = value
  }

  const winRate = readNumber(read(WIN_RATE_COLUMN).replace(PERCENT_SIGN, ''))
  if (winRate === null) fail('notNumber', WIN_RATE_COLUMN)
  const netRunRate = readNumber(read(NET_RUN_RATE_COLUMN))
  if (netRunRate === null) fail('notNumber', NET_RUN_RATE_COLUMN)
  const scored = readRunsOvers(read(FOR_COLUMN))
  if (!scored) fail('notRunsOvers', FOR_COLUMN)
  const conceded = readRunsOvers(read(AGAINST_COLUMN))
  if (!conceded) fail('notRunsOvers', AGAINST_COLUMN)

  const { played, won, lost, noResult, tied, points } = counts
  if (
    errors.length > errorCount ||
    played === undefined ||
    won === undefined ||
    lost === undefined ||
    noResult === undefined ||
    tied === undefined ||
    points === undefined ||
    winRate === null ||
    netRunRate === null ||
    !scored ||
    !conceded
  ) {
    return null
  }

  return {
    teamShortName,
    played,
    won,
    lost,
    noResult,
    tied,
    points,
    winRate,
    netRunRate,
    runsFor: scored.runs,
    oversFaced: scored.overs,
    runsAgainst: conceded.runs,
    oversBowled: conceded.overs,
  }
}

/**
 * Reads a CricClubs points table export. Columns are found by their header (in any order, with
 * CricClubs' padding), rows stay in published order: row 1 is position 1. Reports every problem
 * at once, with its line and column, so an editor can fix the file in one go.
 */
export function parseStandingsCsv(text: string): StandingsCsvResult {
  if (text.length > STANDINGS_CSV_MAX_BYTES) {
    return { success: false, errors: [{ code: 'tooLarge' }] }
  }
  const [header, ...records] = parseCsv(text)
  if (!header) {
    return { success: false, errors: [{ code: 'empty' }] }
  }

  const columns = new Map(header.cells.map((cell, index) => [normalizeCsvHeader(cell), index]))
  const missing = REQUIRED_COLUMNS.filter((column) => !columns.has(column))
  if (missing.length > 0) {
    return {
      success: false,
      errors: missing.map((column) => ({ code: 'missingColumn', column })),
    }
  }
  if (records.length === 0) {
    return { success: false, errors: [{ code: 'noRows' }] }
  }

  const errors: StandingsCsvError[] = []
  const rows: ImportedStandingsRow[] = []
  const seen = new Set<string>()
  for (const record of records) {
    const read: CellReader = (column) => record.cells[columns.get(column) ?? -1]?.trim() ?? ''
    const row = readRow(read, record.line, errors)
    if (!row) continue
    if (seen.has(row.teamShortName)) {
      errors.push({
        code: 'duplicateTeam',
        line: record.line,
        column: TEAM_COLUMN,
        value: row.teamShortName,
      })
      continue
    }
    seen.add(row.teamShortName)
    rows.push(row)
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, rows }
}
