import type { Access, FieldAccess, Where } from 'payload'

import { getCaptainTeamId, getOwnPlayerId, isAdmin, relationId } from './roles'

/**
 * Access rules for the members' app collections (ADR-0024). They hold in the database itself, not
 * only in the app: a player writes their own answers, a captain their own team's records, the
 * Board everything.
 */

/** A where clause matching documents of the captain's team, or `false` for anyone else. */
function ownTeam(user: Parameters<typeof getCaptainTeamId>[0]): Where | false {
  const teamId = getCaptainTeamId(user)
  return teamId === null ? false : { team: { equals: teamId } }
}

/** A where clause matching the member's own documents, or `false` without a linked player. */
function ownPlayer(user: Parameters<typeof getOwnPlayerId>[0]): Where | false {
  const playerId = getOwnPlayerId(user)
  return playerId === null ? false : { player: { equals: playerId } }
}

/** Admins: all; a member: documents of their own player (e.g. their own answers). */
export const adminsOrOwnPlayer: Access = ({ req }) => {
  if (isAdmin(req.user)) return true
  return ownPlayer(req.user)
}

/** Admins: all; a captain: documents of the team they lead (e.g. attendance, their squad). */
export const adminsOrOwnTeam: Access = ({ req }) => {
  if (isAdmin(req.user)) return true
  return ownTeam(req.user)
}

/** Admins: all; a captain: their team's documents; a member: their own (e.g. attendance). */
export const adminsOwnTeamOrOwnPlayer: Access = ({ req }) => {
  if (isAdmin(req.user)) return true
  const conditions = [ownTeam(req.user), ownPlayer(req.user)].filter(
    (condition): condition is Where => condition !== false,
  )
  return conditions.length === 0 ? false : { or: conditions }
}

/** Creating: admins, or a member for their own player only (the player comes from the data). */
export const createForOwnPlayer: Access = ({ req, data }) => {
  if (isAdmin(req.user)) return true
  const playerId = getOwnPlayerId(req.user)
  return (
    playerId !== null && relationId((data as { player?: unknown } | undefined)?.player) === playerId
  )
}

/** Creating: admins, or a captain for their own team only (the team comes from the data). */
export const createForOwnTeam: Access = ({ req, data }) => {
  if (isAdmin(req.user)) return true
  const teamId = getCaptainTeamId(req.user)
  return teamId !== null && relationId((data as { team?: unknown } | undefined)?.team) === teamId
}

/** Approved squads are announced to everyone; drafts are the captain's and the Board's. */
export const approvedOrOwnTeam: Access = ({ req }) => {
  if (!req.user) return false
  if (isAdmin(req.user)) return true
  const team = ownTeam(req.user)
  const approved: Where = { status: { equals: 'approved' } }
  return team === false ? approved : { or: [approved, team] }
}

/**
 * A reason for not going: only the member, the captain of the event's team and admins read it
 * (arc42 §8.3). Who is going is open to all members (motion 2026/06); why someone is not, is not.
 */
export const reasonReaders: FieldAccess = ({ req, doc }) => {
  if (isAdmin(req.user)) return true
  const record = doc as { player?: unknown; team?: unknown } | undefined
  const playerId = getOwnPlayerId(req.user)
  const teamId = getCaptainTeamId(req.user)
  return (
    (playerId !== null && relationId(record?.player) === playerId) ||
    (teamId !== null && relationId(record?.team) === teamId)
  )
}
