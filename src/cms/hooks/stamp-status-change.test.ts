import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { stampStatusChange } from './stamp-status-change'

const NOW = '2026-11-12T19:30:00.000Z'
const EARLIER = '2026-11-10T08:00:00.000Z'

function run(
  data: Record<string, unknown>,
  originalDoc?: object,
  operation: 'create' | 'update' = 'update',
): unknown {
  return stampStatusChange({ data, originalDoc, operation } as never)
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(NOW))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('stampStatusChange', () => {
  it('stamps a new squad', () => {
    expect(run({ fixture: 3, status: 'open' }, undefined, 'create')).toEqual({
      fixture: 3,
      status: 'open',
      statusChangedAt: NOW,
    })
  })

  it('stamps every change of status, also a second submission after a return', () => {
    const returned = { status: 'returned', statusChangedAt: EARLIER }

    expect(run({ status: 'submitted' }, returned)).toMatchObject({ statusChangedAt: NOW })
    expect(run({ status: 'approved' }, { status: 'submitted' })).toMatchObject({
      statusChangedAt: NOW,
    })
  })

  it('keeps the stamp when the status stays, e.g. a changed deadline or recorded no-shows', () => {
    const approved = { status: 'approved', statusChangedAt: EARLIER }

    expect(run({ deadlineDay: 'thursday' }, approved)).toMatchObject({ statusChangedAt: EARLIER })
    expect(run({ status: 'approved', noShows: [4] }, approved)).toMatchObject({
      statusChangedAt: EARLIER,
    })
    expect(run({ note: 'x' }, { status: 'open' })).toMatchObject({ statusChangedAt: null })
  })

  it('ignores a stamp sent in the request', () => {
    const forged = '2030-01-01T00:00:00.000Z'

    expect(
      run({ statusChangedAt: forged }, { status: 'open', statusChangedAt: EARLIER }),
    ).toMatchObject({ statusChangedAt: EARLIER })
    expect(run({ status: 'submitted', statusChangedAt: forged }, { status: 'open' })).toMatchObject(
      { statusChangedAt: NOW },
    )
  })
})
