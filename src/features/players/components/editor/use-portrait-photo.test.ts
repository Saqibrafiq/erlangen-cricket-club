import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { usePortraitPhoto } from './use-portrait-photo'

const PHOTO = new File(['original'], 'saqib.jpg', { type: 'image/jpeg' })
const CUT_OUT = new File(['cut'], 'saqib.webp', { type: 'image/webp' })

const revokeObjectURL = vi.fn()

beforeEach(() => {
  revokeObjectURL.mockClear()
  let next = 0
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn(() => `blob:${String(++next)}`),
      revokeObjectURL,
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePortraitPhoto', () => {
  it('keeps the stored photo until a new one is chosen', async () => {
    const { result } = renderHook(() => usePortraitPhoto(vi.fn()))

    expect(result.current.status).toBe('none')
    expect(result.current.previewUrl).toBeNull()
    expect(await result.current.getUpload()).toBeNull()
  })

  it('removes the background of a chosen photo and uploads the cut-out', async () => {
    const cutOut = vi.fn(() => Promise.resolve(CUT_OUT))
    const { result } = renderHook(() => usePortraitPhoto(cutOut))

    act(() => {
      result.current.choose(PHOTO)
    })
    expect(result.current.status).toBe('processing')

    await waitFor(() => {
      expect(result.current.status).toBe('cutOut')
    })
    expect(cutOut).toHaveBeenCalledWith(PHOTO)
    expect(await result.current.getUpload()).toBe(CUT_OUT)
  })

  it('uses the photo as it is when background removal fails', async () => {
    const { result } = renderHook(() =>
      usePortraitPhoto(() => Promise.reject(new Error('no person'))),
    )

    act(() => {
      result.current.choose(PHOTO)
    })

    await waitFor(() => {
      expect(result.current.status).toBe('failed')
    })
    // jsdom cannot shrink images, so the original is uploaded unchanged.
    expect(await result.current.getUpload()).toBe(PHOTO)
  })

  it('can switch background removal off and on for the chosen photo', async () => {
    const cutOut = vi.fn(() => Promise.resolve(CUT_OUT))
    const { result } = renderHook(() => usePortraitPhoto(cutOut))

    act(() => {
      result.current.setShouldRemoveBackground(false)
    })
    act(() => {
      result.current.choose(PHOTO)
    })
    expect(result.current.status).toBe('asIs')
    expect(cutOut).not.toHaveBeenCalled()

    act(() => {
      result.current.setShouldRemoveBackground(true)
    })
    await waitFor(() => {
      expect(result.current.status).toBe('cutOut')
    })
  })

  it('ignores a slow earlier photo once another one is chosen', async () => {
    let finishFirst: (file: File) => void = () => undefined
    const cutOut = vi
      .fn<(file: File) => Promise<File>>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirst = resolve
          }),
      )
      .mockImplementationOnce(() => Promise.reject(new Error('second fails')))
    const { result } = renderHook(() => usePortraitPhoto(cutOut))

    act(() => {
      result.current.choose(PHOTO)
    })
    act(() => {
      result.current.choose(new File(['other'], 'other.jpg', { type: 'image/jpeg' }))
    })
    await waitFor(() => {
      expect(result.current.status).toBe('failed')
    })
    await act(async () => {
      finishFirst(CUT_OUT)
      await Promise.resolve()
    })

    expect(result.current.status).toBe('failed')
  })

  it('forgets the photo when the choice is cleared, and releases previews', async () => {
    const { result, unmount } = renderHook(() => usePortraitPhoto(vi.fn()))

    act(() => {
      result.current.setShouldRemoveBackground(false)
    })
    act(() => {
      result.current.choose(PHOTO)
    })
    act(() => {
      result.current.choose(null)
    })

    expect(result.current.status).toBe('none')
    expect(await result.current.getUpload()).toBeNull()
    unmount()
    expect(revokeObjectURL).toHaveBeenCalled()
  })
})
