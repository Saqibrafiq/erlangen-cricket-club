import { describe, expect, it } from 'vitest'

import {
  applyMatte,
  decontaminateEdges,
  estimateBackground,
  findVisibleBounds,
  getHeadAndShouldersCrop,
  getPortraitSize,
  HEAD_AND_SHOULDERS_RATIO,
  PORTRAIT_HEIGHT,
} from './portrait'

/** An RGBA image of `pixels` pixels, each `[r, g, b, a]`. */
function image(...pixels: [number, number, number, number][]): Uint8ClampedArray {
  return new Uint8ClampedArray(pixels.flat())
}

describe('applyMatte', () => {
  it('uses the matte as the alpha channel and keeps the colours', () => {
    const rgba = image([10, 20, 30, 255], [40, 50, 60, 255])

    applyMatte(rgba, [0, 200])

    expect([...rgba]).toEqual([10, 20, 30, 0, 40, 50, 60, 200])
  })

  it('treats a missing matte value as transparent', () => {
    const rgba = image([10, 20, 30, 255])

    applyMatte(rgba, { length: 1 })

    expect(rgba[3]).toBe(0)
  })
})

describe('estimateBackground', () => {
  it('averages the colour of the pixels the matte removes', () => {
    const rgba = image([100, 150, 250, 255], [120, 170, 250, 255], [0, 0, 0, 255])

    expect(estimateBackground(rgba, [0, 8, 255])).toEqual([110, 160, 250])
  })

  it('finds no background in a photo that is already cut out', () => {
    expect(estimateBackground(image([0, 0, 0, 255]), [255])).toBeNull()
  })

  it('treats missing matte values as the player', () => {
    expect(estimateBackground(image([0, 0, 0, 255]), { length: 1 })).toBeNull()
  })
})

describe('decontaminateEdges', () => {
  it('removes the sky blue mixed into a half-transparent hair pixel', () => {
    // Dark hair (40, 30, 20) half over sky (130, 180, 250): observed is the average.
    const rgba = image([85, 105, 135, 128])

    decontaminateEdges(rgba, [130, 180, 250])

    // Alpha 128 is 50.2 %, so the recovered colour may be off by one after rounding.
    const [red, green, blue, alpha] = rgba
    expect(Math.abs((red ?? 0) - 40)).toBeLessThanOrEqual(1)
    expect(Math.abs((green ?? 0) - 30)).toBeLessThanOrEqual(1)
    expect(Math.abs((blue ?? 0) - 20)).toBeLessThanOrEqual(1)
    expect(alpha).toBe(128)
  })

  it('leaves the solid player and nearly invisible pixels alone', () => {
    const rgba = image([85, 105, 135, 255], [85, 105, 135, 10], [0, 0, 0, 0])

    decontaminateEdges(rgba, [130, 180, 250])

    expect([...rgba]).toEqual([85, 105, 135, 255, 85, 105, 135, 10, 0, 0, 0, 0])
  })

  it('clamps colours that the un-mixing pushes out of range', () => {
    const rgba = image([250, 5, 128, 128])

    decontaminateEdges(rgba, [0, 255, 128])

    expect([...rgba]).toEqual([255, 0, 128, 128])
  })
})

describe('findVisibleBounds', () => {
  it('frames the visible pixels', () => {
    // 3 × 3: visible at (1, 0) and (2, 1).
    const rgba = new Uint8ClampedArray(3 * 3 * 4)
    rgba[(0 * 3 + 1) * 4 + 3] = 255
    rgba[(1 * 3 + 2) * 4 + 3] = 16

    expect(findVisibleBounds(rgba, 3, 3)).toEqual({ x: 1, y: 0, width: 2, height: 2 })
  })

  it('ignores faint pixels and finds nothing in an empty image', () => {
    const rgba = new Uint8ClampedArray(2 * 2 * 4)
    rgba[3] = 15

    expect(findVisibleBounds(rgba, 2, 2)).toBeNull()
  })
})

describe('getHeadAndShouldersCrop', () => {
  it('keeps the top of a full-length photo, as tall as it is wide plus a little', () => {
    expect(getHeadAndShouldersCrop({ x: 5, y: 10, width: 500, height: 1150 })).toEqual({
      x: 5,
      y: 10,
      width: 500,
      height: 500 * HEAD_AND_SHOULDERS_RATIO,
    })
  })

  it('keeps a head-and-shoulders photo as it is', () => {
    const bounds = { x: 0, y: 0, width: 680, height: 720 }

    expect(getHeadAndShouldersCrop(bounds)).toBe(bounds)
  })
})

describe('getPortraitSize', () => {
  it('scales to the squad photo height, keeping the proportions', () => {
    expect(getPortraitSize({ width: 1100, height: 1210 })).toEqual({
      width: 655,
      height: PORTRAIT_HEIGHT,
    })
  })

  it('never enlarges a small photo, and never collapses to nothing', () => {
    expect(getPortraitSize({ width: 300, height: 330 })).toEqual({ width: 300, height: 330 })
    expect(getPortraitSize({ width: 1, height: 5000 })).toEqual({ width: 1, height: 720 })
  })
})
