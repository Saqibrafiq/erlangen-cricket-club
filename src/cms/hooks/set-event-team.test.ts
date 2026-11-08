import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { pickClubTeamId, setEventTeam } from './set-event-team'

const ECC_I = { id: 7, isClubTeam: true }
const OPPONENT = { id: 9, isClubTeam: false }

function request(found: Record<string, unknown>) {
  const findByID = vi.fn(({ collection }: { collection: string }) =>
    Promise.resolve(found[collection]),
  )
  return { payload: { findByID } } as unknown as PayloadRequest
}

function run(
  data: Record<string, unknown>,
  req: PayloadRequest,
  originalDoc?: object,
): Promise<unknown> {
  return setEventTeam({ data, req, originalDoc, operation: 'create' } as never) as Promise<unknown>
}

describe('pickClubTeamId', () => {
  it("finds the club's team among a fixture's teams", () => {
    expect(pickClubTeamId([OPPONENT, ECC_I])).toBe(7)
  })

  it('returns null when neither team is ours or teams are not populated', () => {
    expect(pickClubTeamId([OPPONENT, { id: 10 }])).toBeNull()
    expect(pickClubTeamId([7, 9, null])).toBeNull()
  })
})

describe('setEventTeam', () => {
  it("takes the team from the fixture's ECC team", async () => {
    const req = request({ fixtures: { team1: OPPONENT, team2: ECC_I } })

    await expect(run({ fixture: 3, player: 30 }, req)).resolves.toEqual({
      fixture: 3,
      player: 30,
      team: 7,
    })
  })

  it("takes the team from the practice's team", async () => {
    const req = request({ 'practice-sessions': { team: 8 } })

    await expect(run({ practice: 5 }, req)).resolves.toMatchObject({ team: 8 })
  })

  it('keeps the event of the stored document on an update', async () => {
    const req = request({ 'practice-sessions': { team: { id: 8 } } })

    await expect(run({ attended: true }, req, { practice: 5 })).resolves.toMatchObject({
      team: 8,
    })
  })

  it('accepts a requested team that matches', async () => {
    const req = request({ 'practice-sessions': { team: 8 } })

    await expect(run({ practice: 5, team: 8 }, req)).resolves.toMatchObject({ team: 8 })
  })

  it('refuses a requested team that does not match the event', async () => {
    const req = request({ 'practice-sessions': { team: 8 } })

    await expect(run({ practice: 5, team: 7 }, req)).rejects.toThrow('does not match')
  })

  it('refuses an event without an ECC team', async () => {
    const req = request({ fixtures: { team1: OPPONENT, team2: { id: 10, isClubTeam: false } } })

    await expect(run({ fixture: 3 }, req)).rejects.toThrow('does not belong')
    await expect(run({}, req)).rejects.toThrow('does not belong')
  })
})
