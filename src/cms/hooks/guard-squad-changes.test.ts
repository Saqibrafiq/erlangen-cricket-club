import { describe, expect, it } from 'vitest'

import { guardSquadChanges } from './guard-squad-changes'

const CAPTAIN = { id: 1, role: 'captain', captainOf: 7 }
const ADMIN = { id: 2, role: 'admin' }
const PICKS = [
  { id: 'a', player: 30, role: 'playing', isBorrowed: false },
  { id: 'b', player: { id: 31 }, role: 'twelfth' },
]

function run(user: object, data: Record<string, unknown>, originalDoc?: object): unknown {
  return guardSquadChanges({ data, originalDoc, req: { user } } as never)
}

describe('guardSquadChanges', () => {
  it('lets a captain submit an open or returned squad', () => {
    for (const status of ['open', 'returned']) {
      expect(run(CAPTAIN, { status: 'submitted', picks: PICKS }, { status })).toMatchObject({
        status: 'submitted',
      })
    }
  })

  it('refuses a captain approving, returning or reopening a squad', () => {
    for (const status of ['approved', 'returned', 'open']) {
      expect(() => run(CAPTAIN, { status }, { status: 'submitted' })).toThrow(
        'Only the Board can approve, return or reopen a squad.',
      )
    }
    expect(() => run(CAPTAIN, { status: 'submitted' })).toThrow('Only the Board')
    expect(() => run(CAPTAIN, { status: 'submitted' }, { status: 'approved' })).toThrow(
      'Only the Board',
    )
  })

  it('locks a submitted squad for the captain until the Board reopens it', () => {
    const submitted = { status: 'submitted', picks: PICKS }

    expect(() => run(CAPTAIN, { picks: [{ player: 32, role: 'playing' }] }, submitted)).toThrow(
      'The squad is submitted: only the Board can reopen it.',
    )
    expect(run(CAPTAIN, { status: 'submitted', picks: PICKS }, submitted)).toBeDefined()
    expect(run(CAPTAIN, { noShows: [30] }, submitted)).toMatchObject({ noShows: [30] })
    expect(() => run(CAPTAIN, { status: 'submitted' }, { status: 'approved' })).toThrow(
      'Only the Board',
    )
  })

  it('lets a captain record no-shows on an announced squad, but not change it', () => {
    const announced = { status: 'approved', picks: PICKS }

    expect(run(CAPTAIN, { status: 'approved', noShows: [30] }, announced)).toMatchObject({
      noShows: [30],
    })
    expect(
      run(
        CAPTAIN,
        {
          picks: [
            { player: { id: 30 }, role: 'playing' },
            { player: 31, role: 'twelfth' },
          ],
        },
        announced,
      ),
    ).toBeDefined()
    expect(() => run(CAPTAIN, { picks: [{ player: 32, role: 'playing' }] }, announced)).toThrow(
      'The squad is submitted',
    )
  })

  it('lets a captain change the picks before the announcement', () => {
    expect(
      run(CAPTAIN, { picks: [{ player: 32, role: 'playing' }] }, { status: 'open' }),
    ).toBeDefined()
    expect(
      run(CAPTAIN, { picks: 'not a list' }, { status: 'open', picks: undefined }),
    ).toBeDefined()
  })

  it('leaves the Board free to change anything', () => {
    expect(run(ADMIN, { status: 'approved', picks: [] }, { status: 'submitted' })).toMatchObject({
      status: 'approved',
    })
    expect(run(ADMIN, { status: 'open' }, undefined)).toMatchObject({ status: 'open' })
  })
})
