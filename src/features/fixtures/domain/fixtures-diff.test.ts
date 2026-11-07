import { describe, expect, it } from 'vitest'

import type { ImportedFixture } from './fixtures-csv'
import { diffFixtures, type ExistingImportedFixture } from './fixtures-diff'

function imported(overrides: Partial<ImportedFixture> = {}): ImportedFixture {
  return {
    key: 'ECC-I|NCC-I|1',
    line: 2,
    day: '2027-05-16',
    startTime: '11:00',
    homeShortName: 'ECC-I',
    awayShortName: 'NCC-I',
    ground: { name: 'Erlangen Cricket Ground', address: null },
    stage: 'league',
    ...overrides,
  }
}

function existing(overrides: Partial<ExistingImportedFixture> = {}): ExistingImportedFixture {
  return {
    id: 1,
    key: 'ECC-I|NCC-I|1',
    day: '2027-05-16',
    startTime: '11:00',
    homeShortName: 'ECC-I',
    awayShortName: 'NCC-I',
    groundName: 'Erlangen Cricket Ground',
    stage: 'league',
    status: 'scheduled',
    ...overrides,
  }
}

const KNOWN = {
  teams: new Set(['ECC-I', 'NCC-I']),
  grounds: new Set(['Erlangen Cricket Ground']),
}

describe('diffFixtures', () => {
  it('lists everything as new for a first upload, with teams and grounds to add', () => {
    const diff = diffFixtures(
      [],
      [
        imported(),
        imported({
          key: 'SKCC|ECC-I|1',
          homeShortName: 'SKCC',
          awayShortName: 'ECC-I',
          ground: { name: 'Tennenlohe', address: null },
        }),
      ],
      KNOWN,
    )

    expect(diff.changes.map((change) => change.kind)).toEqual(['new', 'new'])
    expect(diff.newTeams).toEqual(['SKCC'])
    expect(diff.newGrounds).toEqual(['Tennenlohe'])
    expect(diff.isUnchanged).toBe(false)
  })

  it('shows which details of a rescheduled fixture change', () => {
    const diff = diffFixtures(
      [existing()],
      [imported({ day: '2027-05-23', startTime: null, ground: null, stage: 'final' })],
      KNOWN,
    )

    expect(diff.changes).toEqual([
      {
        kind: 'changed',
        fixture: expect.objectContaining({ day: '2027-05-23' }) as unknown,
        fields: ['day', 'startTime', 'ground', 'stage'],
      },
    ])
  })

  it('leaves played fixtures alone and removes upcoming ones the file no longer lists', () => {
    const played = existing({ status: 'completed' })
    const dropped = existing({ id: 2, key: 'NCC-I|ECC-I|1' })
    const finished = existing({ id: 3, key: 'NCC-I|ECC-I|2', status: 'abandoned' })

    const diff = diffFixtures([played, dropped, finished], [imported()], KNOWN)

    expect(diff.changes).toEqual([{ kind: 'played', fixture: imported() }])
    expect(diff.removed).toEqual([dropped])
    expect(diff.isUnchanged).toBe(false)
  })

  it('recognises an identical re-upload', () => {
    const diff = diffFixtures([existing()], [imported()], KNOWN)

    expect(diff).toEqual({
      changes: [{ kind: 'unchanged', fixture: imported() }],
      removed: [],
      newTeams: [],
      newGrounds: [],
      isUnchanged: true,
    })
  })
})
