import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useVanishing, VANISH_TIMEOUT_MS } from './use-vanishing'

describe('useVanishing', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('marks the item as vanishing and resolves once the effect has finished', async () => {
    const { result } = renderHook(() => useVanishing())
    const done = vi.fn()

    act(() => {
      void result.current.vanish(7).then(done)
    })
    expect(result.current.vanishingId).toBe(7)
    await Promise.resolve()
    expect(done).not.toHaveBeenCalled()

    act(() => {
      result.current.finish()
    })
    await vi.waitFor(() => {
      expect(done).toHaveBeenCalledOnce()
    })
  })

  it('resolves anyway when no item plays the effect', async () => {
    const { result } = renderHook(() => useVanishing())
    const done = vi.fn()

    act(() => {
      void result.current.vanish(7).then(done)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(VANISH_TIMEOUT_MS)
    })

    expect(done).toHaveBeenCalledOnce()
  })
})
