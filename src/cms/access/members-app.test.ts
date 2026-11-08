import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  adminsOrOwnPlayer,
  adminsOrOwnTeam,
  adminsOwnTeamOrOwnPlayer,
  createForOwnPlayer,
  createForOwnTeam,
  reasonReaders,
  squadSelectionReaders,
} from './members-app'
import type { SessionUser } from './roles'

const ADMIN: SessionUser = { id: 1, role: 'admin' }
const CAPTAIN: SessionUser = { id: 2, role: 'captain', player: 20, captainOf: 7 }
const PLAYER: SessionUser = { id: 3, role: 'player', player: 30 }
const UNLINKED: SessionUser = { id: 4, role: 'player' }

function call(access: (args: never) => unknown, user: SessionUser | null, extra: object = {}) {
  return access({ req: { user } as unknown as PayloadRequest, ...extra } as never)
}

describe('adminsOrOwnPlayer', () => {
  it("gives admins everything and members their own player's documents", () => {
    expect(call(adminsOrOwnPlayer, ADMIN)).toBe(true)
    expect(call(adminsOrOwnPlayer, PLAYER)).toEqual({ player: { equals: 30 } })
    expect(call(adminsOrOwnPlayer, UNLINKED)).toBe(false)
    expect(call(adminsOrOwnPlayer, null)).toBe(false)
  })
})

describe('adminsOrOwnTeam', () => {
  it("gives admins everything and captains their own team's documents", () => {
    expect(call(adminsOrOwnTeam, ADMIN)).toBe(true)
    expect(call(adminsOrOwnTeam, CAPTAIN)).toEqual({ team: { equals: 7 } })
    expect(call(adminsOrOwnTeam, PLAYER)).toBe(false)
  })
})

describe('adminsOwnTeamOrOwnPlayer', () => {
  it("gives a captain their team's and their own documents", () => {
    expect(call(adminsOwnTeamOrOwnPlayer, CAPTAIN)).toEqual({
      or: [{ team: { equals: 7 } }, { player: { equals: 20 } }],
    })
  })

  it('gives a player their own documents, admins everything, others nothing', () => {
    expect(call(adminsOwnTeamOrOwnPlayer, PLAYER)).toEqual({ or: [{ player: { equals: 30 } }] })
    expect(call(adminsOwnTeamOrOwnPlayer, ADMIN)).toBe(true)
    expect(call(adminsOwnTeamOrOwnPlayer, UNLINKED)).toBe(false)
  })
})

describe('createForOwnPlayer', () => {
  it('lets a member answer only for their own player', () => {
    expect(call(createForOwnPlayer, PLAYER, { data: { player: 30 } })).toBe(true)
    expect(call(createForOwnPlayer, PLAYER, { data: { player: 31 } })).toBe(false)
    expect(call(createForOwnPlayer, UNLINKED, { data: { player: 30 } })).toBe(false)
    expect(call(createForOwnPlayer, PLAYER, {})).toBe(false)
    expect(call(createForOwnPlayer, ADMIN, { data: { player: 31 } })).toBe(true)
  })
})

describe('createForOwnTeam', () => {
  it('lets a captain record only for their own team', () => {
    expect(call(createForOwnTeam, CAPTAIN, { data: { team: { id: 7 } } })).toBe(true)
    expect(call(createForOwnTeam, CAPTAIN, { data: { team: 8 } })).toBe(false)
    expect(call(createForOwnTeam, PLAYER, { data: { team: 7 } })).toBe(false)
    expect(call(createForOwnTeam, CAPTAIN, {})).toBe(false)
    expect(call(createForOwnTeam, ADMIN, { data: { team: 8 } })).toBe(true)
  })
})

describe('squadSelectionReaders', () => {
  const draft = { status: 'submitted', team: 7 }
  const announced = { status: 'approved', team: 7 }

  it("shows a draft selection to the team's captain and the Board only", () => {
    expect(call(squadSelectionReaders, CAPTAIN, { doc: draft })).toBe(true)
    expect(call(squadSelectionReaders, ADMIN, { doc: draft })).toBe(true)
    expect(call(squadSelectionReaders, PLAYER, { doc: draft })).toBe(false)
    expect(call(squadSelectionReaders, { ...CAPTAIN, captainOf: 8 }, { doc: draft })).toBe(false)
    expect(call(squadSelectionReaders, PLAYER, { doc: undefined })).toBe(false)
  })

  it('announces an approved selection to every member', () => {
    expect(call(squadSelectionReaders, PLAYER, { doc: announced })).toBe(true)
    expect(call(squadSelectionReaders, null, { doc: announced })).toBe(false)
  })
})

describe('reasonReaders', () => {
  const answer = { player: 30, team: 7 }

  it('lets the member, the captain of the team and admins read a reason', () => {
    expect(call(reasonReaders, PLAYER, { doc: answer })).toBe(true)
    expect(call(reasonReaders, CAPTAIN, { doc: answer })).toBe(true)
    expect(call(reasonReaders, ADMIN, { doc: answer })).toBe(true)
  })

  it('hides it from other members and other captains', () => {
    expect(call(reasonReaders, { ...PLAYER, player: 31 }, { doc: answer })).toBe(false)
    expect(call(reasonReaders, { ...CAPTAIN, captainOf: 8 }, { doc: answer })).toBe(false)
    expect(call(reasonReaders, UNLINKED, { doc: undefined })).toBe(false)
  })
})
