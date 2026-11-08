import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { type EditorLoadResult, useEditorLoad } from './use-editor-load'

const OK: EditorLoadResult<string> = { status: 'ok', data: 'Erlangen' }

describe('useEditorLoad', () => {
  it('starts loading and shows the result', async () => {
    const load = vi.fn(() => Promise.resolve(OK))
    const { result } = renderHook(() => useEditorLoad(load))

    expect(result.current.state).toEqual({ status: 'loading' })
    await waitFor(() => {
      expect(result.current.state).toEqual(OK)
    })
  })

  it('starts from a known state, e.g. an empty form for something new', () => {
    const load = () => Promise.resolve(OK)
    const { result } = renderHook(() => useEditorLoad(load, OK))

    expect(result.current.state).toEqual(OK)
  })

  it('loads again on reload after a failure', async () => {
    const load = vi
      .fn<() => Promise<EditorLoadResult<string>>>()
      .mockResolvedValueOnce({ status: 'error' })
      .mockResolvedValueOnce(OK)
    const { result } = renderHook(() => useEditorLoad(load))
    await waitFor(() => {
      expect(result.current.state).toEqual({ status: 'error' })
    })

    act(() => {
      result.current.reload()
    })

    expect(result.current.state).toEqual({ status: 'loading' })
    await waitFor(() => {
      expect(result.current.state).toEqual(OK)
    })
  })

  it('drops a result that arrives after the editor closed', async () => {
    let resolve: (result: EditorLoadResult<string>) => void = () => undefined
    const load = () =>
      new Promise<EditorLoadResult<string>>((done) => {
        resolve = done
      })
    const { result, unmount } = renderHook(() => useEditorLoad(load))

    unmount()
    resolve(OK)
    await Promise.resolve()

    expect(result.current.state).toEqual({ status: 'loading' })
  })
})
