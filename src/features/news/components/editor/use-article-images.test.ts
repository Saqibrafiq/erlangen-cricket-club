import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { EditorImage, UploadImageResult } from '../../editor-types'
import { useArticleImages } from './use-article-images'

function image(id: number): EditorImage {
  return { id, url: `/api/media/file/${String(id)}.webp`, alt: 'Photo', width: 1200, height: 800 }
}

const FILE = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })

function renderImages(upload: (formData: FormData) => Promise<UploadImageResult>) {
  return renderHook(() =>
    useArticleImages({
      initialFeatured: null,
      initialGallery: [image(1)],
      upload,
      locale: 'de',
      getAlt: () => 'Season review',
    }),
  )
}

describe('useArticleImages', () => {
  it('uploads several gallery photos one by one, describing them with the title', async () => {
    let next = 10
    const upload = vi.fn((_formData: FormData) =>
      Promise.resolve({ status: 'ok' as const, image: image(++next) }),
    )
    const { result } = renderImages(upload)

    await act(() => result.current.addToGallery([FILE, FILE]))

    expect(result.current.gallery.map((each) => each.id)).toEqual([1, 11, 12])
    expect(upload).toHaveBeenCalledTimes(2)
    const [formData] = upload.mock.calls[0] ?? []
    expect(formData?.get('alt')).toBe('Season review')
    expect(formData?.get('locale')).toBe('de')
    expect(result.current.isUploading).toBe(false)
  })

  it('sets and removes the main image and removes gallery photos', async () => {
    const { result } = renderImages(() => Promise.resolve({ status: 'ok', image: image(20) }))

    await act(() => result.current.chooseFeatured(FILE))
    expect(result.current.featured?.id).toBe(20)

    act(() => {
      result.current.removeFeatured()
      result.current.removeFromGallery(1)
    })
    expect(result.current.featured).toBeNull()
    expect(result.current.gallery).toEqual([])
  })

  it.each([
    [{ status: 'invalid', reason: 'type' }, 'imageType'],
    [{ status: 'invalid', reason: 'size' }, 'imageSize'],
    [{ status: 'unauthorized' }, 'unauthorized'],
    [{ status: 'error' }, 'imageUpload'],
  ] as const)('reports a failed upload (%o) as %s', async (response, error) => {
    const { result } = renderImages(() => Promise.resolve(response))

    await act(() => result.current.chooseFeatured(FILE))

    expect(result.current.error).toBe(error)
    expect(result.current.featured).toBeNull()
  })
})
