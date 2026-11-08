import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  adminField,
  admins,
  adminsOrSelf,
  getCaptainTeamId,
  getOwnPlayerId,
  isAdmin,
  members,
  relationId,
  type SessionUser,
} from './roles'

const ADMIN: SessionUser = { id: 1, role: 'admin' }
const CAPTAIN: SessionUser = { id: 2, role: 'captain', player: 20, captainOf: { id: 7 } }
const PLAYER: SessionUser = { id: 3, role: 'player', player: { id: 30 } }

/** Calls an access function with only `req.user` set, as the rules read nothing else. */
function call(access: (args: never) => unknown, user: SessionUser | null) {
  return access({ req: { user } as unknown as PayloadRequest } as never)
}

describe('relationId', () => {
  it('reads an id or a populated document', () => {
    expect(relationId(7)).toBe(7)
    expect(relationId('7')).toBe('7')
    expect(relationId({ id: 7, name: 'ECC I' })).toBe(7)
  })

  it('returns null for anything else', () => {
    expect(relationId(null)).toBeNull()
    expect(relationId(undefined)).toBeNull()
    expect(relationId({ name: 'no id' })).toBeNull()
    expect(relationId({ id: true })).toBeNull()
  })
})

describe('roles', () => {
  it('knows who is an admin', () => {
    expect(isAdmin(ADMIN)).toBe(true)
    expect(isAdmin(CAPTAIN)).toBe(false)
    expect(isAdmin(null)).toBe(false)
  })

  it('finds the linked player', () => {
    expect(getOwnPlayerId(PLAYER)).toBe(30)
    expect(getOwnPlayerId(CAPTAIN)).toBe(20)
    expect(getOwnPlayerId(ADMIN)).toBeNull()
    expect(getOwnPlayerId(null)).toBeNull()
  })

  it("finds a captain's team, and only a captain's", () => {
    expect(getCaptainTeamId(CAPTAIN)).toBe(7)
    expect(getCaptainTeamId({ ...PLAYER, captainOf: 7 })).toBeNull()
    expect(getCaptainTeamId(null)).toBeNull()
  })
})

describe('access rules', () => {
  it('lets only admins through `admins` and `adminField`', () => {
    expect(call(admins, ADMIN)).toBe(true)
    expect(call(admins, CAPTAIN)).toBe(false)
    expect(call(admins, null)).toBe(false)
    expect(call(adminField, ADMIN)).toBe(true)
    expect(call(adminField, PLAYER)).toBe(false)
  })

  it('lets any signed-in member through `members`', () => {
    expect(call(members, PLAYER)).toBe(true)
    expect(call(members, null)).toBe(false)
  })

  it('gives admins every account and members only their own', () => {
    expect(call(adminsOrSelf, ADMIN)).toBe(true)
    expect(call(adminsOrSelf, PLAYER)).toEqual({ id: { equals: 3 } })
    expect(call(adminsOrSelf, null)).toBe(false)
  })
})
