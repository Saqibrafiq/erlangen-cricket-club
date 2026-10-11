import { afterEach, describe, expect, it, vi } from 'vitest'

import { MAX_IMAGE_EDGE, resizeImage } from './resize-image'

const photo = new File([new Uint8Array(100)], 'saqib.jpg', { type: 'image/jpeg' })

function stubCanvas(blobType: string | null) {
  const drawImage = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function toBlob(callback) {
    callback(blobType ? new Blob(['webp'], { type: blobType }) : null)
  })
  return drawImage
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('resizeImage', () => {
  it('scales a large photo down to the longest edge and re-encodes it as WebP', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => Promise.resolve({ width: 3000, height: 4000, close: vi.fn() })),
    )
    const drawImage = stubCanvas('image/webp')

    const resized = await resizeImage(photo)

    expect(resized.name).toBe('saqib.webp')
    expect(resized.type).toBe('image/webp')
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 900, MAX_IMAGE_EDGE)
  })

  it('never enlarges a small photo', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => Promise.resolve({ width: 400, height: 500, close: vi.fn() })),
    )
    const drawImage = stubCanvas('image/webp')

    await resizeImage(photo)

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 400, 500)
  })

  it('keeps the original where the browser cannot help', async () => {
    // No createImageBitmap (as in jsdom).
    expect(await resizeImage(photo)).toBe(photo)

    // Not an image at all.
    const pdf = new File(['%PDF'], 'form.pdf', { type: 'application/pdf' })
    expect(await resizeImage(pdf)).toBe(pdf)

    // Cannot decode it.
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => Promise.reject(new Error('HEIC'))),
    )
    expect(await resizeImage(photo)).toBe(photo)
  })

  it('keeps the original when WebP cannot be encoded or there is no canvas', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(() => Promise.resolve({ width: 2000, height: 2000, close: vi.fn() })),
    )
    stubCanvas('image/png')
    expect(await resizeImage(photo)).toBe(photo)

    vi.restoreAllMocks()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(await resizeImage(photo)).toBe(photo)
  })
})
