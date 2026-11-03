import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getFixtureImportDataAction, importFixturesAction } from './actions'

const mocks = vi.hoisted(() => ({
  payload: {
    auth: vi.fn(),
    find: vi.fn(),
    findByID: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    logger: { error: vi.fn() },
  },
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: () => Promise.resolve(mocks.payload) }))
vi.mock('next/headers', () => ({ headers: () => Promise.resolve(new Headers()) }))

const { payload } = mocks
const USER = { id: 1, collection: 'users' }
const AS_EDITOR = { user: USER, overrideAccess: false }
const COMPETITION_ID = 7
const CSV = `Date,Time,Home,Away,Ground,Address,Stage
16.05.2027,11:00,ECC-I,NCC-I,Erlangen Cricket Ground,"Siedlerstraße 1, 91056 Erlangen",League
23.05.2027,,SKCC,ECC-I,Tennenlohe,,`

const ECC = { id: 1, shortName: 'ECC-I' }
const NCC = { id: 2, shortName: 'NCC-I' }

/** A fixture an earlier import created; `key` without the "csv-7-" prefix. */
function importedDoc(key: string, overrides: Record<string, unknown> = {}) {
  return {
    id: 50,
    importKey: `csv-${String(COMPETITION_ID)}-${key}`,
    date: '2027-05-16T12:00:00.000Z',
    startTime: '11:00',
    team1: ECC,
    team2: NCC,
    ground: { id: 3, name: 'Erlangen Cricket Ground' },
    stage: 'league',
    status: 'scheduled',
    ...overrides,
  }
}

/** Answers each `find` by collection; fixtures are the ones earlier imports created. */
function givenDatabase({
  teams = [ECC, NCC],
  grounds = [
    {
      id: 3,
      name: 'Erlangen Cricket Ground',
      address: null as string | null,
      clubCode: null as string | null,
    },
  ],
  fixtures = [] as unknown[],
} = {}) {
  payload.find.mockImplementation(({ collection }: { collection: string }) => {
    const docs: Record<string, unknown[]> = {
      teams,
      grounds,
      fixtures,
      competitions: [{ id: COMPETITION_ID, name: 'BCV Regionalliga Bayern', season: '2027' }],
    }
    return Promise.resolve({ docs: docs[collection] ?? [] })
  })
  payload.create.mockImplementation(({ collection }: { collection: string }) =>
    Promise.resolve({ id: collection === 'teams' ? 9 : collection === 'grounds' ? 4 : 60 }),
  )
  payload.findByID.mockResolvedValue({ name: 'BCV Regionalliga Bayern', season: '2027' })
}

function formData(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value)
  }
  return data
}

describe('fixtures import actions', () => {
  beforeEach(() => {
    for (const mock of [
      payload.auth,
      payload.find,
      payload.findByID,
      payload.create,
      payload.update,
      payload.delete,
      payload.logger.error,
    ]) {
      mock.mockReset()
    }
    payload.auth.mockResolvedValue({ user: USER })
  })

  it('change nothing without a session', async () => {
    payload.auth.mockResolvedValue({ user: null })

    expect(await getFixtureImportDataAction()).toEqual({ status: 'unauthorized' })
    expect(
      await importFixturesAction(formData({ competition: String(COMPETITION_ID), csv: CSV })),
    ).toEqual({ status: 'unauthorized' })
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('loads competitions with their imported fixtures, teams and grounds', async () => {
    givenDatabase({
      fixtures: [importedDoc('ECC-I|NCC-I|1'), { ...importedDoc('x'), importKey: 'seed-1' }],
    })

    const result = await getFixtureImportDataAction()

    expect(result).toEqual({
      status: 'ok',
      data: {
        competitions: [
          {
            id: COMPETITION_ID,
            name: 'BCV Regionalliga Bayern',
            season: '2027',
            fixtures: [
              {
                id: 50,
                key: 'ECC-I|NCC-I|1',
                day: '2027-05-16',
                startTime: '11:00',
                homeShortName: 'ECC-I',
                awayShortName: 'NCC-I',
                groundName: 'Erlangen Cricket Ground',
                stage: 'league',
                status: 'scheduled',
              },
            ],
          },
        ],
        teams: ['ECC-I', 'NCC-I'],
        grounds: [{ name: 'Erlangen Cricket Ground', address: null, clubCode: null }],
      },
    })
  })

  it('creates the schedule, adding teams and grounds and filling in a missing address', async () => {
    givenDatabase()

    const result = await importFixturesAction(
      formData({ competition: String(COMPETITION_ID), csv: CSV }),
    )

    expect(result).toEqual({
      status: 'imported',
      competition: { name: 'BCV Regionalliga Bayern', season: '2027' },
      created: 2,
      updated: 0,
      removed: 0,
      teamsAdded: 1,
      groundsAdded: 1,
    })
    expect(payload.update).toHaveBeenCalledWith({
      collection: 'grounds',
      id: 3,
      data: { address: 'Siedlerstraße 1, 91056 Erlangen' },
      ...AS_EDITOR,
    })
    expect(payload.create).toHaveBeenCalledWith({
      collection: 'fixtures',
      data: {
        competition: COMPETITION_ID,
        date: '2027-05-16T12:00:00.000Z',
        startTime: '11:00',
        ground: 3,
        stage: 'league',
        team1: 1,
        team2: 2,
        status: 'scheduled',
        importKey: 'csv-7-ECC-I|NCC-I|1',
      },
      ...AS_EDITOR,
    })
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'fixtures',
        data: expect.objectContaining({ team1: 9, ground: 4, startTime: null }) as unknown,
      }),
    )
  })

  it('updates rescheduled fixtures, removes dropped ones and never touches played ones', async () => {
    givenDatabase({
      teams: [ECC, NCC, { id: 9, shortName: 'SKCC' }],
      grounds: [
        { id: 3, name: 'Erlangen Cricket Ground', address: 'Siedlerstraße 1', clubCode: null },
        { id: 4, name: 'Tennenlohe', address: null, clubCode: null },
      ],
      fixtures: [
        importedDoc('ECC-I|NCC-I|1', { startTime: '13:00' }),
        importedDoc('SKCC|ECC-I|1', { id: 51, status: 'completed' }),
        importedDoc('NCC-I|ECC-I|1', { id: 52 }),
      ],
    })

    const result = await importFixturesAction(
      formData({ competition: String(COMPETITION_ID), csv: CSV }),
    )

    expect(result).toMatchObject({ created: 0, updated: 1, removed: 1 })
    expect(payload.update).toHaveBeenCalledOnce()
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'fixtures', id: 50 }),
    )
    expect(payload.delete).toHaveBeenCalledWith({ collection: 'fixtures', id: 52, ...AS_EDITOR })
    expect(payload.create).not.toHaveBeenCalled()
  })

  it("saves the home team's ground when the file names none", async () => {
    givenDatabase({
      grounds: [
        { id: 3, name: 'Erlangen Cricket Ground', address: 'Siedlerstraße 1', clubCode: 'ECC' },
      ],
    })

    await importFixturesAction(
      formData({
        competition: String(COMPETITION_ID),
        csv: ['Date,Home,Away', '16.05.2027,ECC-II,NCC-I'].join('\n'),
      }),
    )

    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'fixtures',
        data: expect.objectContaining({ ground: 3 }) as unknown,
      }),
    )
  })

  it('starts a new competition for a new season first', async () => {
    givenDatabase()
    payload.create.mockImplementation(({ collection }: { collection: string }) =>
      Promise.resolve({ id: collection === 'competitions' ? COMPETITION_ID : 60 }),
    )

    await importFixturesAction(
      formData({
        competition: 'new',
        name: 'BCV Regionalliga Bayern',
        season: '2027',
        maxOvers: '50',
        csv: CSV,
      }),
    )

    expect(payload.create).toHaveBeenNthCalledWith(1, {
      collection: 'competitions',
      data: { name: 'BCV Regionalliga Bayern', season: '2027', maxOvers: 50, slug: '' },
      ...AS_EDITOR,
    })
  })

  it('rejects an invalid form or file without touching the database', async () => {
    expect(await importFixturesAction(formData({ competition: 'new', csv: CSV }))).toMatchObject({
      status: 'invalid',
    })
    expect(
      await importFixturesAction(formData({ competition: '7', csv: 'Date,Home,Away\nsoon,A,B' })),
    ).toMatchObject({ status: 'invalidFile', errors: [{ code: 'notDate' }] })
    expect(payload.find).not.toHaveBeenCalled()
  })

  it('reports a failed import or load', async () => {
    payload.find.mockRejectedValue(new Error('database down'))

    expect(await importFixturesAction(formData({ competition: '7', csv: CSV }))).toEqual({
      status: 'error',
    })
    expect(await getFixtureImportDataAction()).toEqual({ status: 'error' })
    expect(payload.logger.error).toHaveBeenCalledTimes(2)
  })
})
