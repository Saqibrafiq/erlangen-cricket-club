import { normalizeCsvHeader, parseCsv } from '@/shared/lib/csv'

import type { FixtureGround, FixtureStage } from '../types'

/** One fixture of a schedule CSV (the club's template, see FIXTURES_CSV_TEMPLATE). */
export type ImportedFixture = {
  /**
   * Identifies the fixture across uploads: home, away and which meeting of the two this is.
   * Moving a match to another day keeps its key, so a re-upload shows "changed", not "new".
   */
  key: string
  line: number
  /** ISO day, e.g. "2027-05-16". */
  day: string
  startTime: string | null
  homeShortName: string
  awayShortName: string
  ground: FixtureGround | null
  /** The ground was filled in from the home team (see `applyHomeGrounds`), not the file. */
  isHomeGround?: true
  stage: FixtureStage
}

export type FixturesCsvErrorCode =
  | 'empty'
  | 'tooLarge'
  | 'missingColumn'
  | 'noRows'
  | 'notDate'
  | 'notTime'
  | 'missingTeam'
  | 'sameTeams'
  | 'unknownStage'
  | 'addressWithoutGround'

export type FixturesCsvError = {
  code: FixturesCsvErrorCode
  line?: number
  column?: string
  value?: string
}

export type FixturesCsvResult =
  { success: true; fixtures: ImportedFixture[] } | { success: false; errors: FixturesCsvError[] }

/** A season's schedule is a few kilobytes; anything far larger is the wrong file. */
export const FIXTURES_CSV_MAX_BYTES = 200 * 1024

const COLUMNS = {
  date: 'DATE',
  time: 'TIME',
  home: 'HOME',
  away: 'AWAY',
  ground: 'GROUND',
  address: 'ADDRESS',
  stage: 'STAGE',
} as const
const REQUIRED_COLUMNS = [COLUMNS.date, COLUMNS.home, COLUMNS.away]

/** What editors download and fill in; the example row shows every format the import reads. */
export const FIXTURES_CSV_TEMPLATE = [
  'Date,Time,Home,Away,Ground,Address,Stage',
  '16.05.2027,11:00,ECC-I,NCC-I,Erlangen Cricket Ground,"Siedlerstraße 1, 91056 Erlangen",League',
  '',
].join('\r\n')

const ISO_DATE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
/** German and British order as Excel writes it: 16.05.2027, 16/05/2027. */
const DAY_FIRST_DATE = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/
/** "11:00", "9:30" or Excel's "11:00:00". */
const TIME = /^(\d{1,2}):(\d{2})(?::\d{2})?$/
const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60

const STAGES: Record<string, FixtureStage> = {
  league: 'league',
  qualifier: 'qualifier',
  'semi-final': 'semi-final',
  'semi final': 'semi-final',
  semifinal: 'semi-final',
  final: 'final',
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** "2027-05-16" for a real calendar day in either format, else `null`. */
function readDay(cell: string): string | null {
  const iso = ISO_DATE.exec(cell)
  const dayFirst = DAY_FIRST_DATE.exec(cell)
  const [year, month, day] = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : dayFirst
      ? [Number(dayFirst[3]), Number(dayFirst[2]), Number(dayFirst[1])]
      : [NaN, NaN, NaN]
  const date = new Date(Date.UTC(year, month - 1, day))
  // Date rolls 31.02 over to March; a real day survives the round trip.
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCDate() !== day ||
    date.getUTCMonth() !== month - 1
  ) {
    return null
  }
  return `${String(year)}-${pad(month)}-${pad(day)}`
}

/** "09:30" for a valid time, `null` for an empty cell, `undefined` when invalid. */
function readTime(cell: string): string | null | undefined {
  if (cell === '') {
    return null
  }
  const match = TIME.exec(cell)
  const hours = Number(match?.[1])
  const minutes = Number(match?.[2])
  if (!match || hours >= HOURS_PER_DAY || minutes >= MINUTES_PER_HOUR) {
    return undefined
  }
  return `${pad(hours)}:${pad(minutes)}`
}

/** League by default; `undefined` for a stage we don't know. */
function readStage(cell: string): FixtureStage | undefined {
  return cell === '' ? 'league' : STAGES[cell.toLowerCase().replace(/\s+/g, ' ')]
}

/**
 * Reads a season's schedule made from the league's PDF in Excel (see FIXTURES_CSV_TEMPLATE).
 * Columns are found by header in any order; Time, Ground, Address and Stage are optional. Every
 * problem is reported at once, with its line and column.
 */
export function parseFixturesCsv(text: string): FixturesCsvResult {
  if (text.length > FIXTURES_CSV_MAX_BYTES) {
    return { success: false, errors: [{ code: 'tooLarge' }] }
  }
  const [header, ...records] = parseCsv(text)
  if (!header) {
    return { success: false, errors: [{ code: 'empty' }] }
  }
  const columns = new Map(header.cells.map((cell, index) => [normalizeCsvHeader(cell), index]))
  const missing = REQUIRED_COLUMNS.filter((column) => !columns.has(column))
  if (missing.length > 0) {
    return { success: false, errors: missing.map((column) => ({ code: 'missingColumn', column })) }
  }
  if (records.length === 0) {
    return { success: false, errors: [{ code: 'noRows' }] }
  }

  const errors: FixturesCsvError[] = []
  const fixtures: ImportedFixture[] = []
  const meetings = new Map<string, number>()
  for (const { line, cells } of records) {
    const read = (column: string) => {
      const index = columns.get(column)
      return index === undefined ? '' : (cells[index]?.trim() ?? '')
    }
    const fail = (code: FixturesCsvErrorCode, column: string) => {
      errors.push({ code, line, column, value: read(column) })
    }
    const errorCount = errors.length

    const day = readDay(read(COLUMNS.date))
    if (!day) fail('notDate', COLUMNS.date)
    const startTime = readTime(read(COLUMNS.time))
    if (startTime === undefined) fail('notTime', COLUMNS.time)
    const home = read(COLUMNS.home)
    const away = read(COLUMNS.away)
    if (!home) fail('missingTeam', COLUMNS.home)
    if (!away) fail('missingTeam', COLUMNS.away)
    if (home && home === away) fail('sameTeams', COLUMNS.away)
    const stage = readStage(read(COLUMNS.stage))
    if (!stage) fail('unknownStage', COLUMNS.stage)
    const groundName = read(COLUMNS.ground)
    const address = read(COLUMNS.address)
    if (address && !groundName) fail('addressWithoutGround', COLUMNS.address)

    if (errors.length > errorCount || !day || startTime === undefined || !stage) {
      continue
    }
    const pair = `${home}|${away}`
    const meeting = (meetings.get(pair) ?? 0) + 1
    meetings.set(pair, meeting)
    fixtures.push({
      key: `${pair}|${String(meeting)}`,
      line,
      day,
      startTime,
      homeShortName: home,
      awayShortName: away,
      ground: groundName ? { name: groundName, address: address || null } : null,
      stage,
    })
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, fixtures }
}
