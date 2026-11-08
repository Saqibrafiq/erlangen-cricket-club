import type { Access, FieldAccess } from 'payload'

/**
 * Who an account is (ADR-0024): every member is a player; a captain also leads one team; an admin
 * is the Board and manages the website and the app.
 */
export const ROLES = ['player', 'captain', 'admin'] as const
export type Role = (typeof ROLES)[number]

/** The fields of a signed-in account the access rules look at. */
export type SessionUser = {
  id: number | string
  role?: Role | null
  player?: unknown
  captainOf?: unknown
}

/** A relationship value as Payload hands it over: an id, or the related document at depth > 0. */
export function relationId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const { id } = value
    return typeof id === 'number' || typeof id === 'string' ? id : null
  }
  return null
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === 'admin'
}

/** The player record linked to the account, if any. */
export function getOwnPlayerId(user: SessionUser | null | undefined): number | string | null {
  return user ? relationId(user.player) : null
}

/** The team a captain leads, or `null` for anyone who is not a captain. */
export function getCaptainTeamId(user: SessionUser | null | undefined): number | string | null {
  return user?.role === 'captain' ? relationId(user.captainOf) : null
}

/** The Board only: website editing, the admin panel, member management. */
export const admins: Access = ({ req }) => isAdmin(req.user)

/** Any signed-in member, whatever their role. */
export const members: Access = ({ req }) => Boolean(req.user)

/** Admins see every account; a member sees only their own. */
export const adminsOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  return isAdmin(req.user) ? true : { id: { equals: req.user.id } }
}

/** A field only admins may read or change, e.g. a member's role. */
export const adminField: FieldAccess = ({ req }) => isAdmin(req.user)
