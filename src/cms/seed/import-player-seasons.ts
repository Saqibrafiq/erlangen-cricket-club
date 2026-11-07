import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Payload } from 'payload'

import type { PlayerSeason } from '../../payload-types'
import { slugify } from '../../shared/lib/slugify'
import type { RevalidateContext } from '../hooks/revalidate-pages'
import { matchPlayerName } from './match-player-name'

const DATA_FILE = 'data/player-seasons-2025-2026.json'

// Writes from a script have no Next.js request to revalidate; the deploy rebuilds the pages.
const CONTEXT: RevalidateContext = { disableRevalidate: true }

/** Club teams the league lists players under, by their league code. */
const CLUB_TEAM_NAMES: Readonly<Record<string, string>> = {
  'ECC-I': 'Erlangen Cricket Club I',
  'ECC-II': 'Erlangen Cricket Club II',
  'ECC-III': 'Erlangen Cricket Club III',
}

/** The club's squad teams today; ECC-III appears in season records (stats) only. */
const SQUAD_TEAM_CODES: readonly string[] = ['ECC-I', 'ECC-II']
/** Where a player goes who played for neither squad team (e.g. only for ECC-III). */
const DEFAULT_SQUAD_TEAM_CODE = 'ECC-II'

const CONSENT_NOTE =
  'Published with the 2025/2026 league season records at the club president’s instruction (5 November 2026).'

type SeasonData = {
  player: string
  season: number
  competition: PlayerSeason['competition']
  format: PlayerSeason['format']
  /** League code (e.g. "ECC-II") of a per-team record; `null` for a whole-season record. */
  team: string | null
  batting: NonNullable<PlayerSeason['batting']> | null
  bowling: NonNullable<PlayerSeason['bowling']> | null
}

type ImportData = { source: string; seasons: SeasonData[] }

export type ImportSummary = {
  playersCreated: string[]
  /** Players this import created earlier, whose squad teams it set again from the records. */
  playersUpdated: number
  teamsCreated: string[]
  seasonsCreated: number
  seasonsUpdated: number
}

function readData(): ImportData {
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  return JSON.parse(readFileSync(path.join(dirname, DATA_FILE), 'utf8')) as ImportData
}

async function resolveClubTeams(
  payload: Payload,
  codes: ReadonlySet<string>,
  summary: ImportSummary,
): Promise<Map<string, number>> {
  const ids = new Map<string, number>()
  for (const code of codes) {
    const { docs } = await payload.find({
      collection: 'teams',
      where: { shortName: { equals: code } },
      limit: 1,
      depth: 0,
    })
    const existing = docs[0]
    if (existing) {
      ids.set(code, existing.id)
      continue
    }
    const name = CLUB_TEAM_NAMES[code]
    if (!name) throw new Error(`Unknown club team "${code}" in ${DATA_FILE}`)
    const team = await payload.create({
      collection: 'teams',
      data: { name, shortName: code, isClubTeam: true },
      context: CONTEXT,
    })
    ids.set(code, team.id)
    summary.teamsCreated.push(name)
  }
  return ids
}

/** The squad teams a player belongs to: the ones they played for, else the default team. */
function getSquadTeams(
  leagueName: string,
  seasons: readonly SeasonData[],
  teamIds: ReadonlyMap<string, number>,
): number[] {
  const played = new Set(
    seasons
      .filter((season) => season.player === leagueName && season.team !== null)
      .map((season) => season.team ?? '')
      .filter((code) => SQUAD_TEAM_CODES.includes(code)),
  )
  const codes = played.size > 0 ? [...played] : [DEFAULT_SQUAD_TEAM_CODE]
  return codes.map((code) => teamIds.get(code)).filter((id): id is number => id !== undefined)
}

/**
 * Finds each league name's player, adding the ones the site does not list yet. Players this import
 * added (recognised by their consent note) get their squad teams set from the records on every
 * run; players the club entered itself are left as they are.
 */
async function resolvePlayers(
  payload: Payload,
  seasons: readonly SeasonData[],
  teamIds: ReadonlyMap<string, number>,
  summary: ImportSummary,
): Promise<Map<string, number>> {
  const { docs: sitePlayers } = await payload.find({
    collection: 'players',
    limit: 0,
    depth: 0,
    pagination: false,
  })
  const ids = new Map<string, number>()
  const leagueNames = [...new Set(seasons.map((season) => season.player))]

  for (const leagueName of leagueNames) {
    const teams = getSquadTeams(leagueName, seasons, teamIds)
    const match = matchPlayerName(leagueName, sitePlayers)
    if (match) {
      ids.set(leagueName, match.id)
      if (match.consentNote === CONSENT_NOTE) {
        await payload.update({
          collection: 'players',
          id: match.id,
          data: { teams },
          context: CONTEXT,
        })
        summary.playersUpdated += 1
      }
      continue
    }
    const player = await payload.create({
      collection: 'players',
      data: {
        name: leagueName,
        slug: slugify(leagueName),
        teams,
        isFeaturedOnHome: false,
        hasPublishConsent: true,
        consentNote: CONSENT_NOTE,
      },
      context: CONTEXT,
    })
    ids.set(leagueName, player.id)
    summary.playersCreated.push(leagueName)
  }
  return ids
}

/**
 * Loads the league's 2025/2026 season records (ADR-0022): whole seasons per format, and each
 * team's league matches. Safe to run again: existing records (same player, season, competition,
 * format and team) are updated, existing players and teams reused.
 */
export async function importPlayerSeasons(payload: Payload): Promise<ImportSummary> {
  const { seasons } = readData()
  const summary: ImportSummary = {
    playersCreated: [],
    playersUpdated: 0,
    teamsCreated: [],
    seasonsCreated: 0,
    seasonsUpdated: 0,
  }
  const teamCodes = new Set([
    ...SQUAD_TEAM_CODES,
    ...seasons.flatMap((season) => (season.team ? [season.team] : [])),
  ])
  const teamIds = await resolveClubTeams(payload, teamCodes, summary)
  const playerIds = await resolvePlayers(payload, seasons, teamIds, summary)

  for (const season of seasons) {
    const player = playerIds.get(season.player)
    if (player === undefined) throw new Error(`No player for "${season.player}"`)
    const team = season.team === null ? null : (teamIds.get(season.team) ?? null)
    const data = {
      player,
      season: season.season,
      competition: season.competition,
      format: season.format,
      team,
      batting: season.batting ?? {},
      bowling: season.bowling ?? {},
    }
    const { docs } = await payload.find({
      collection: 'player-seasons',
      where: {
        player: { equals: player },
        season: { equals: season.season },
        competition: { equals: season.competition },
        format: { equals: season.format },
        team: team === null ? { exists: false } : { equals: team },
      },
      limit: 1,
      depth: 0,
    })
    const existing = docs[0]
    if (existing) {
      await payload.update({
        collection: 'player-seasons',
        id: existing.id,
        data,
        context: CONTEXT,
      })
      summary.seasonsUpdated += 1
    } else {
      await payload.create({ collection: 'player-seasons', data, context: CONTEXT })
      summary.seasonsCreated += 1
    }
  }
  return summary
}

export type ImportPlan = {
  /** League name → the site player it will be attached to. */
  matched: { leagueName: string; siteName: string }[]
  /** League names the site does not list yet: the import would add them as players. */
  newPlayers: string[]
  /** Club teams the import would create (league codes). */
  newTeams: string[]
  seasons: number
}

/**
 * What the import would do, without writing anything: run it against production first and check
 * that every player is matched as intended (an unmatched short name would become a duplicate).
 */
export async function planPlayerSeasonImport(payload: Payload): Promise<ImportPlan> {
  const { seasons } = readData()
  const { docs: sitePlayers } = await payload.find({
    collection: 'players',
    limit: 0,
    depth: 0,
    pagination: false,
  })
  const plan: ImportPlan = { matched: [], newPlayers: [], newTeams: [], seasons: seasons.length }
  for (const leagueName of new Set(seasons.map((season) => season.player))) {
    const match = matchPlayerName(leagueName, sitePlayers)
    if (match) plan.matched.push({ leagueName, siteName: match.name })
    else plan.newPlayers.push(leagueName)
  }
  const teamCodes = new Set([
    ...SQUAD_TEAM_CODES,
    ...seasons.flatMap((season) => (season.team ? [season.team] : [])),
  ])
  for (const code of teamCodes) {
    const { totalDocs } = await payload.count({
      collection: 'teams',
      where: { shortName: { equals: code } },
    })
    if (totalDocs === 0) plan.newTeams.push(code)
  }
  return plan
}
