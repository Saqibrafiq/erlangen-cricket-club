import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import {
  findPassPlayer,
  importSpielerpasses,
  nameFromFile,
  type PassFile,
  planSpielerpassImport,
} from './import-spielerpasses'

const pass = (
  registeredName: string,
  file = `${registeredName.replace(' ', '_')}.pdf`,
): PassFile => ({
  file,
  details: { registeredName, passNumber: `DCB-${registeredName.length}`, validFrom: '2022-07-07' },
  image: Buffer.from('jpeg'),
})

const PLAYERS = [
  { id: 1, name: 'Saqib Rafiq' },
  { id: 2, name: 'Rohit' },
  { id: 3, name: 'Ali Shaan' },
]

function fakePayload(existing: object[] = [], transactionID: string | null = 'tx-1') {
  let nextId = 100
  const payload = {
    db: {
      beginTransaction: vi.fn(() => Promise.resolve(transactionID)),
      commitTransaction: vi.fn(() => Promise.resolve()),
      rollbackTransaction: vi.fn(() => Promise.resolve()),
    },
    find: vi.fn(({ collection }: { collection: string }) =>
      Promise.resolve({ docs: collection === 'players' ? PLAYERS : existing }),
    ),
    create: vi.fn(({ data }: { data: { name?: string } }) => {
      nextId += 1
      return Promise.resolve({ id: nextId, name: data.name })
    }),
    update: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({})),
  }
  return { payload, asPayload: payload as unknown as Payload }
}

describe('nameFromFile', () => {
  it('turns a DCB file name into a name', () => {
    expect(nameFromFile('Hassan Raza_Khan.pdf')).toBe('Hassan Raza Khan')
    expect(nameFromFile('saqib_rafiq.PDF')).toBe('saqib rafiq')
  })
})

describe('findPassPlayer', () => {
  it('matches by the registered name, through the pass and league aliases', () => {
    expect(findPassPlayer(pass('Saqib Rafiq'), PLAYERS)?.id).toBe(1)
    // Pass name → club name (Rohit Venkata) → website name (Rohit).
    expect(findPassPlayer(pass('Venkata Rohit Naidu Janapareddy'), PLAYERS)?.id).toBe(2)
    expect(findPassPlayer(pass('Ali Shan'), PLAYERS)?.id).toBe(3)
  })

  it('falls back to the file name, and finds nobody for a new member', () => {
    expect(findPassPlayer(pass('S. Rafiq', 'Saqib_Rafiq.pdf'), PLAYERS)?.id).toBe(1)
    expect(findPassPlayer(pass('Neetesh Verma'), PLAYERS)).toBeNull()
  })
})

describe('planSpielerpassImport', () => {
  it('plans updates, new passes, new players and skipped second passes', async () => {
    const { asPayload } = fakePayload([{ id: 50, player: { id: 1 }, card: 70 }])

    const plan = await planSpielerpassImport(asPayload, [
      pass('Saqib Rafiq'),
      pass('Ali Shan'),
      pass('Neetesh Verma'),
      pass('Saqib Rafiq', 'Saqib_Rafiq_2.pdf'),
    ])

    expect(plan.matched.map((p) => [p.player.name, p.existing])).toEqual([
      ['Saqib Rafiq', { id: 50, cardId: 70 }],
      ['Ali Shaan', null],
    ])
    expect(plan.newPlayers.map((p) => p.details.registeredName)).toEqual(['Neetesh Verma'])
    expect(plan.duplicates.map((p) => p.file)).toEqual(['Saqib_Rafiq_2.pdf'])
  })
})

describe('importSpielerpasses', () => {
  it('uploads each card, creates or updates the pass, and deletes a replaced card', async () => {
    const { payload, asPayload } = fakePayload([{ id: 50, player: 1, card: 70 }])
    const plan = await planSpielerpassImport(asPayload, [
      pass('Saqib Rafiq'),
      pass('Ali Shan'),
      pass('Neetesh Verma'),
    ])

    const summary = await importSpielerpasses(asPayload, plan)

    expect(summary).toEqual({ created: 2, updated: 1, playersCreated: ['Neetesh Verma'] })
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'players',
        data: {
          name: 'Neetesh Verma',
          slug: 'neetesh-verma',
          isFeaturedOnHome: false,
          hasPublishConsent: false,
        },
        context: { disableRevalidate: true },
      }),
    )
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'spielerpass-cards',
        file: expect.objectContaining({
          name: 'spielerpass-saqib-rafiq.jpg',
          mimetype: 'image/jpeg',
        }) as object,
      }),
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'spielerpasses',
        id: 50,
        data: expect.objectContaining({
          player: 1,
          passNumber: 'DCB-11',
          validFrom: '2022-07-07T12:00:00.000Z',
        }) as object,
      }),
    )
    expect(payload.delete).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'spielerpass-cards', id: 70 }),
    )
  })

  it('keeps an existing pass without a card, and a pass without a valid-from date', async () => {
    const { payload, asPayload } = fakePayload([{ id: 51, player: 3, card: null }])
    const noDate = {
      ...pass('Ali Shan'),
      details: { ...pass('Ali Shan').details, validFrom: null },
    }

    await importSpielerpasses(asPayload, await planSpielerpassImport(asPayload, [noDate]))

    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ validFrom: null }) as object }),
    )
    expect(payload.delete).not.toHaveBeenCalled()
  })

  it('writes everything in one transaction, as the system', async () => {
    const { payload, asPayload } = fakePayload()

    await importSpielerpasses(
      asPayload,
      await planSpielerpassImport(asPayload, [pass('Saqib Rafiq')]),
    )

    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({ overrideAccess: true, req: { transactionID: 'tx-1' } }),
    )
    expect(payload.db.commitTransaction).toHaveBeenCalledWith('tx-1')
    expect(payload.db.rollbackTransaction).not.toHaveBeenCalled()
  })

  it('rolls everything back when one write fails', async () => {
    const { payload, asPayload } = fakePayload()
    const plan = await planSpielerpassImport(asPayload, [
      pass('Saqib Rafiq'),
      pass('Neetesh Verma'),
    ])
    payload.create.mockRejectedValueOnce(new Error('too large'))

    await expect(importSpielerpasses(asPayload, plan)).rejects.toThrow('too large')

    expect(payload.db.rollbackTransaction).toHaveBeenCalledWith('tx-1')
    expect(payload.db.commitTransaction).not.toHaveBeenCalled()
  })

  it('still writes on a database without transactions', async () => {
    const { payload, asPayload } = fakePayload([], null)

    await importSpielerpasses(
      asPayload,
      await planSpielerpassImport(asPayload, [pass('Saqib Rafiq')]),
    )

    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({ req: {} }))
    expect(payload.db.commitTransaction).not.toHaveBeenCalled()

    payload.create.mockRejectedValueOnce(new Error('down'))
    await expect(
      importSpielerpasses(asPayload, await planSpielerpassImport(asPayload, [pass('Saqib Rafiq')])),
    ).rejects.toThrow('down')
    expect(payload.db.rollbackTransaction).not.toHaveBeenCalled()
  })
})
