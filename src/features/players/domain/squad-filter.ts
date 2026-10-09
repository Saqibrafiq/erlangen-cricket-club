import type { Player, PlayerTeam, PlayingRole } from '../types'
import { searchPlayers } from './players'

/** Display order of the role filter: batting, then bowling, then both, then keeping. */
export const PLAYING_ROLES: readonly PlayingRole[] = [
  'batter',
  'bowler',
  'all-rounder',
  'wicketkeeper',
]

export type SquadFilter = {
  query: string
  /** Only players of this club team; `null` for all teams. */
  teamId: number | null
  /** Only players with this role; `null` for all roles. */
  role: PlayingRole | null
}

export const NO_SQUAD_FILTER: SquadFilter = { query: '', teamId: null, role: null }

function matchesTeam(player: Player, teamId: number | null): boolean {
  return teamId === null || player.teams.some((team) => team.id === teamId)
}

function matchesRole(player: Player, role: PlayingRole | null): boolean {
  return role === null || player.playingRole === role
}

/** Players matching the name search, team and role. */
export function filterSquad(players: readonly Player[], filter: SquadFilter): Player[] {
  return searchPlayers(players, filter.query).filter(
    (player) => matchesTeam(player, filter.teamId) && matchesRole(player, filter.role),
  )
}

export type TeamOption = {
  team: PlayerTeam
  count: number
}

/** The club teams players are assigned to, by name, with how many players each has. */
export function getTeamOptions(players: readonly Player[]): TeamOption[] {
  const options = new Map<number, TeamOption>()
  for (const team of players.flatMap((player) => player.teams)) {
    const option = options.get(team.id)
    options.set(team.id, { team, count: (option?.count ?? 0) + 1 })
  }

  return [...options.values()].sort((a, b) => a.team.name.localeCompare(b.team.name))
}

export type RoleOption = {
  role: PlayingRole
  count: number
}

/** The playing roles present in the squad, in display order, with how many players have each. */
export function getRoleOptions(players: readonly Player[]): RoleOption[] {
  return PLAYING_ROLES.map((role) => ({
    role,
    count: players.filter((player) => player.playingRole === role).length,
  })).filter((option) => option.count > 0)
}
