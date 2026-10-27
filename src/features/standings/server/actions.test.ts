import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getStandingsImportDataAction, importStandingsAction } from './actions'

const mocks = vi.hoisted(() => ({
  payload: {
    auth: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    logger: { error: vi.fn() },
  },
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: () => Promise.resolve(mocks.payload) }))
vi.mock('next/headers', () => ({ headers: () => Promise.resolve(new Headers()) }))

const { payload } = mocks
const USER = { id: 1, collection: 'users' }
const AS_EDITOR = { user: USER, overrideAccess: false }
const CSV = `SNO,TEAM,MAT,WON,LOST,N/R,TIE,PTS,WIN%,NET RR,FOR,AGAINST
1,ECC-I,14,9,3,0,2,80.0,75.00%,1.1694,1954/243.4,1596/233
2,SKCC,14,1,13,0,0,8.0,7.14%,-4.0217,1378/271,1624/178.2`
const COMPETITION = { id: 3, name: 'BCV Regionalliga Bayern', season: '2027', slug: 'bcv-2027' }

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value)
  }
  return data
}

describe('standings import actions', () => {
  beforeEach(() => {
    for (const mock of [
      payload.auth,
      payload.find,
      payload.create,
      payload.update,
      payload.logger.error,
    ]) {
      mock.mockReset()
    }
    payload.auth.mockResolvedValue({ user: USER })
  })

  it('change nothing without a session', async () => {
    payload.auth.mockResolvedValue({ user: null })

    expect(await getStandingsImportDataAction()).toEqual({ status: 'unauthorized' })
    expect(await importStandingsAction(formData({ competition: '3', csv: CSV }))).toEqual({
      status: 'unauthorized',
    })
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('loads competitions with their current tables, and all teams', async () => {
    payload.find.mockImplementation(({ collection }: { collection: string }) =>
      Promise.resolve(
        collection === 'teams'
          ? { docs: [{ id: 1, name: 'Erlangen CC I', shortName: 'ECC-I', isClubTeam: true }] }
          : {
              docs: [
                {
                  ...COMPETITION,
                  standings: [
                    {
                      team: { id: 1, shortName: 'ECC-I' },
                      played: 1,
                      won: 1,
                      lost: 0,
                      noResult: 0,
                      tied: 0,
                      points: 8,
                      winRate: 100,
                      netRunRate: 1,
                      runsFor: 100,
                      oversFaced: '20',
                      runsAgainst: 80,
                      oversBowled: '20',
                    },
                    // A row whose team wasn't populated is skipped, not guessed.
                    { team: 2 },
                  ],
                },
              ],
            },
      ),
    )

    const result = await getStandingsImportDataAction()

    expect(result).toMatchObject({
      status: 'ok',
      data: {
        competitions: [{ id: 3, rows: [{ teamShortName: 'ECC-I', points: 8 }] }],
        teams: [{ id: 1, shortName: 'ECC-I', isClubTeam: true }],
      },
    })
  })

  it('replaces the table, adding teams new to the club', async () => {
    payload.find.mockResolvedValue({ docs: [{ id: 1, shortName: 'ECC-I' }] })
    payload.create.mockResolvedValue({ id: 9 })
    payload.update.mockResolvedValue(COMPETITION)

    const result = await importStandingsAction(formData({ competition: '3', csv: CSV }))

    expect(result).toEqual({
      status: 'imported',
      competition: { name: COMPETITION.name, season: '2027', slug: 'bcv-2027' },
      teamCount: 2,
      teamsAdded: 1,
    })
    expect(payload.create).toHaveBeenCalledWith({
      collection: 'teams',
      data: { name: 'SKCC', shortName: 'SKCC' },
      ...AS_EDITOR,
    })
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'competitions',
        id: 3,
        data: {
          standings: [
            expect.objectContaining({ team: 1, points: 80, oversFaced: '243.4' }) as unknown,
            expect.objectContaining({ team: 9, netRunRate: -4.0217 }) as unknown,
          ],
        },
        ...AS_EDITOR,
      }),
    )
  })

  it('creates a new competition for a new season first', async () => {
    payload.find.mockResolvedValue({
      docs: [
        { id: 1, shortName: 'ECC-I' },
        { id: 2, shortName: 'SKCC' },
      ],
    })
    payload.create.mockResolvedValue({ id: 3 })
    payload.update.mockResolvedValue(COMPETITION)

    await importStandingsAction(
      formData({
        competition: 'new',
        name: 'BCV Regionalliga Bayern',
        season: '2027',
        maxOvers: '50',
        csv: CSV,
      }),
    )

    expect(payload.create).toHaveBeenCalledWith({
      collection: 'competitions',
      data: { name: 'BCV Regionalliga Bayern', season: '2027', maxOvers: 50, slug: '' },
      ...AS_EDITOR,
    })
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }))
  })

  it('rejects an invalid form or file without touching the database', async () => {
    expect(
      await importStandingsAction(formData({ competition: 'new', name: '', csv: CSV })),
    ).toMatchObject({ status: 'invalid', fieldErrors: { name: 'required' } })
    expect(
      await importStandingsAction(formData({ competition: '3', csv: 'TEAM\nECC-I' })),
    ).toMatchObject({ status: 'invalidFile' })
    expect(payload.find).not.toHaveBeenCalled()
  })

  it('reports a failed import', async () => {
    payload.find.mockRejectedValue(new Error('database down'))

    expect(await importStandingsAction(formData({ competition: '3', csv: CSV }))).toEqual({
      status: 'error',
    })
    expect(await getStandingsImportDataAction()).toEqual({ status: 'error' })
    expect(payload.logger.error).toHaveBeenCalledTimes(2)
  })
})
