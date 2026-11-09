import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { applyCorrection, recordDecision } from './apply-correction'

function request(existing: object[] = []) {
  const payload = {
    find: vi.fn(() => Promise.resolve({ docs: existing })),
    update: vi.fn(() => Promise.resolve({})),
    create: vi.fn(() => Promise.resolve({})),
  }
  return { req: { payload, user: { id: 4 } } as unknown as PayloadRequest, payload }
}

const REQUEST = { practice: 5, player: { id: 30 }, status: 'requested' }

function apply(doc: object, previousDoc: object, req: PayloadRequest) {
  return applyCorrection({
    doc,
    previousDoc,
    req,
    operation: 'update',
  } as never) as Promise<unknown>
}

describe('recordDecision', () => {
  const run = (data: object, originalDoc?: object, user: object | null = { id: 4 }) =>
    recordDecision({ data, originalDoc, req: { user } } as never) as object

  it('keeps who accepted or declined a request', () => {
    expect(run({ status: 'accepted' }, REQUEST)).toEqual({ status: 'accepted', decidedBy: 4 })
  })

  it('records nobody for a new request, an unchanged status or a system change', () => {
    expect(run({ ...REQUEST })).toEqual(REQUEST)
    expect(run({ note: 'x' }, REQUEST)).toEqual({ note: 'x' })
    expect(run({ status: 'requested' }, REQUEST)).toEqual({ status: 'requested' })
    expect(run({ status: 'declined' }, REQUEST, null)).toEqual({ status: 'declined' })
  })
})

describe('applyCorrection', () => {
  it('marks the player present on their existing record when a request is accepted', async () => {
    const { req, payload } = request([{ id: 40 }])

    await apply({ ...REQUEST, status: 'accepted' }, REQUEST, req)

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'attendance',
        where: { practice: { equals: 5 }, player: { equals: 30 } },
      }),
    )
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'attendance', id: 40, data: { attended: true } }),
    )
  })

  it('creates the attendance record when the player was never ticked', async () => {
    const { req, payload } = request()

    await apply({ ...REQUEST, status: 'accepted' }, REQUEST, req)

    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'attendance',
        data: { practice: 5, player: 30, attended: true, isWalkIn: false },
      }),
    )
  })

  it('changes nothing for other decisions, a repeat, or a request without its practice', async () => {
    const { req, payload } = request()

    await apply({ ...REQUEST, status: 'declined' }, REQUEST, req)
    await apply({ ...REQUEST, status: 'accepted' }, { ...REQUEST, status: 'accepted' }, req)
    await apply({ status: 'accepted', player: 30 }, {}, req)

    expect(payload.find).not.toHaveBeenCalled()
    expect(payload.create).not.toHaveBeenCalled()
  })
})
