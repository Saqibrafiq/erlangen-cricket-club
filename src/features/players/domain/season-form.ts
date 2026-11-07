import { z } from 'zod'

import { isValidOvers } from '@/domain/cricket'

import type { SeasonCompetition, SeasonFormat } from '../types'

export const SEASON_COMPETITIONS = [
  'club',
  'district',
] as const satisfies readonly SeasonCompetition[]

/**
 * The formats of a whole-season record, all matches first: career totals add those up; T20 and
 * 50-over are its league parts. A per-team record is always `league` (set by choosing a team).
 */
export const SEASON_FORMATS = [
  'all',
  't20',
  'fifty-over',
] as const satisfies readonly SeasonFormat[]

/** The format of a record for one team: its league matches, T20 and 50-over together. */
export const TEAM_SEASON_FORMAT = 'league' satisfies SeasonFormat

/** The club's first season; the league's records start later, but nothing is older. */
export const FIRST_SEASON = 2010
export const LAST_SEASON = 2100

export const BATTING_FIELDS = [
  'matches',
  'innings',
  'notOuts',
  'runs',
  'balls',
  'highestScore',
  'hundreds',
  'fifties',
  'fours',
  'sixes',
] as const

export const BOWLING_COUNT_FIELDS = [
  'matches',
  'innings',
  'maidens',
  'runsConceded',
  'wickets',
  'bestWickets',
  'bestRuns',
  'dotBalls',
  'fourWicketHauls',
  'fiveWicketHauls',
  'hatTricks',
  'wides',
  'noBalls',
] as const

export type BattingField = (typeof BATTING_FIELDS)[number]
export type BowlingCountField = (typeof BOWLING_COUNT_FIELDS)[number]

export type BattingInput = Record<BattingField, number> & { isHighestScoreNotOut: boolean }
export type BowlingInput = Record<BowlingCountField, number> & { overs: string }

/** A season record as the form submits it, ready to store. */
export type SeasonInput = {
  season: number
  competition: SeasonCompetition
  format: SeasonFormat
  /** The club team of a per-team record; `null` for a whole season. */
  teamId: number | null
  batting: BattingInput | null
  bowling: BowlingInput | null
}

export type SeasonFormErrorCode =
  | 'required'
  | 'invalidSeason'
  | 'invalidNumber'
  | 'invalidOvers'
  | 'notOutsAboveInnings'
  | 'nothingRecorded'
  | 'duplicateSeason'

/** Field names in the form: `season`, `batting.runs`, `bowling.overs`, … */
export type SeasonFieldErrors = Partial<Record<string, SeasonFormErrorCode>>

export type SeasonFormResult =
  { success: true; data: SeasonInput } | { success: false; fieldErrors: SeasonFieldErrors }

const isChecked = (value: FormDataEntryValue | null) => value === 'on'

/** A text field's trimmed value; files and missing fields read as empty. */
function readText(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

function readCount(formData: FormData, name: string, errors: SeasonFieldErrors): number {
  const raw = readText(formData, name)
  // An empty count means none, e.g. no hat-tricks.
  if (raw === '') return 0
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 0) {
    errors[name] = 'invalidNumber'
    return 0
  }
  return value
}

function readRequiredCount(formData: FormData, name: string, errors: SeasonFieldErrors): number {
  if (readText(formData, name) === '') {
    errors[name] = 'required'
    return 0
  }
  return readCount(formData, name, errors)
}

function readBatting(formData: FormData, errors: SeasonFieldErrors): BattingInput {
  const counts = Object.fromEntries(
    BATTING_FIELDS.map((field) => {
      const name = `batting.${field}`
      const read = field === 'matches' ? readRequiredCount : readCount
      return [field, read(formData, name, errors)]
    }),
  ) as Record<BattingField, number>

  if (counts.notOuts > counts.innings) {
    errors['batting.notOuts'] = 'notOutsAboveInnings'
  }
  return {
    ...counts,
    isHighestScoreNotOut: isChecked(formData.get('batting.isHighestScoreNotOut')),
  }
}

function readBowling(formData: FormData, errors: SeasonFieldErrors): BowlingInput {
  const counts = Object.fromEntries(
    BOWLING_COUNT_FIELDS.map((field) => {
      const name = `bowling.${field}`
      const read = field === 'matches' ? readRequiredCount : readCount
      return [field, read(formData, name, errors)]
    }),
  ) as Record<BowlingCountField, number>

  const overs = readText(formData, 'bowling.overs') || '0'
  if (!isValidOvers(overs)) {
    errors['bowling.overs'] = 'invalidOvers'
  }
  return { ...counts, overs }
}

const headerSchema = z.object({
  season: z.coerce.number().int().min(FIRST_SEASON).max(LAST_SEASON),
  competition: z.enum(SEASON_COMPETITIONS),
  format: z.enum(SEASON_FORMATS),
  teamId: z.preprocess(
    (value) => (value === '' || value === null ? null : value),
    z.coerce.number().int().positive().nullable(),
  ),
})

/**
 * Reads the season form. Batting and bowling are optional sections (a player may only bat), each
 * switched on by its checkbox; empty counts mean zero, except matches. Choosing a team makes it a
 * record of that team's league matches.
 */
export function parseSeasonForm(formData: FormData): SeasonFormResult {
  const errors: SeasonFieldErrors = {}
  const header = headerSchema.safeParse({
    season: formData.get('season'),
    competition: formData.get('competition'),
    format: formData.get('format'),
    teamId: formData.get('teamId'),
  })
  if (!header.success) {
    for (const issue of header.error.issues) {
      const field = String(issue.path[0])
      errors[field] = field === 'season' ? 'invalidSeason' : 'required'
    }
  }

  const batting = isChecked(formData.get('hasBatting')) ? readBatting(formData, errors) : null
  const bowling = isChecked(formData.get('hasBowling')) ? readBowling(formData, errors) : null
  if (!batting && !bowling) {
    errors.hasBatting = 'nothingRecorded'
  }

  if (!header.success || Object.keys(errors).length > 0) {
    return { success: false, fieldErrors: errors }
  }
  const teamId = header.data.competition === 'district' ? null : header.data.teamId
  return {
    success: true,
    data: {
      ...header.data,
      // A record for one team counts that team's league matches; district seasons have no club team.
      format: teamId === null ? header.data.format : TEAM_SEASON_FORMAT,
      teamId,
      batting,
      bowling,
    },
  }
}
