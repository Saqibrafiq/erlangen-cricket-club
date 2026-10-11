/*
 * Image maths for player portraits, on raw RGBA pixels (4 bytes per pixel), so it runs anywhere
 * and is fully unit-tested. The browser supplies the pixels and the matte (see cut-out-portrait).
 */

/** Height of every squad photo, as the existing cut-outs: cards and profiles scale from it. */
export const PORTRAIT_HEIGHT = 720
/** Head and shoulders: a cut-out taller than this (height ÷ width) is cropped from the top. */
export const HEAD_AND_SHOULDERS_RATIO = 1.1
/** Pixels at least this opaque (0–255) count as the player when trimming. */
const VISIBLE_ALPHA = 16
/** Matte values at most this count as pure background when estimating its colour. */
const BACKGROUND_ALPHA = 8
/** Edge pixels this transparent or more are left alone: the un-mixing would only amplify noise. */
const MIN_EDGE_ALPHA = 24
const OPAQUE = 255
const CHANNELS = 4

export type Rect = { x: number; y: number; width: number; height: number }
export type Rgb = readonly [number, number, number]

/** Uses the matte (one 0–255 value per pixel) as the image's alpha channel. */
export function applyMatte(rgba: Uint8ClampedArray, matte: ArrayLike<number>): void {
  for (let pixel = 0; pixel < matte.length; pixel++) {
    rgba[pixel * CHANNELS + 3] = matte[pixel] ?? 0
  }
}

/**
 * The average colour of what the matte marks as background (e.g. the sky), or `null` when the
 * photo has none, such as a photo that was already cut out.
 */
export function estimateBackground(rgba: Uint8ClampedArray, matte: ArrayLike<number>): Rgb | null {
  let red = 0
  let green = 0
  let blue = 0
  let count = 0
  for (let pixel = 0; pixel < matte.length; pixel++) {
    if ((matte[pixel] ?? OPAQUE) <= BACKGROUND_ALPHA) {
      const offset = pixel * CHANNELS
      red += rgba[offset] ?? 0
      green += rgba[offset + 1] ?? 0
      blue += rgba[offset + 2] ?? 0
      count++
    }
  }

  return count === 0 ? null : [red / count, green / count, blue / count]
}

/**
 * Removes the background's colour from semi-transparent edge pixels (hair, shoulders), so no
 * blue sky or wall colour fringes the player on the club green. Each edge pixel is a mix of
 * player F and background B by its alpha a: I = a·F + (1 − a)·B, so F = (I − (1 − a)·B) / a.
 */
export function decontaminateEdges(rgba: Uint8ClampedArray, background: Rgb): void {
  for (let offset = 0; offset < rgba.length; offset += CHANNELS) {
    const alpha = rgba[offset + 3] ?? 0
    if (alpha < MIN_EDGE_ALPHA || alpha === OPAQUE) {
      continue
    }
    const coverage = alpha / OPAQUE
    const unmix = (observed: number, backgroundValue: number) =>
      (observed - (1 - coverage) * backgroundValue) / coverage
    const [red, green, blue] = background
    // Uint8ClampedArray rounds and clamps to 0–255.
    rgba[offset] = unmix(rgba[offset] ?? 0, red)
    rgba[offset + 1] = unmix(rgba[offset + 1] ?? 0, green)
    rgba[offset + 2] = unmix(rgba[offset + 2] ?? 0, blue)
  }
}

/** The smallest rectangle around the visible player, or `null` if nothing is visible. */
export function findVisibleBounds(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): Rect | null {
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if ((rgba[(y * width + x) * CHANNELS + 3] ?? 0) >= VISIBLE_ALPHA) {
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
  }

  return right < 0 ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 }
}

/**
 * Head and shoulders, like the other squad photos: a full-length cut-out keeps its top part only
 * (as tall as it is wide, plus a little); a portrait already that shape stays as it is.
 */
export function getHeadAndShouldersCrop(bounds: Rect): Rect {
  const maxHeight = Math.round(bounds.width * HEAD_AND_SHOULDERS_RATIO)
  return bounds.height <= maxHeight ? bounds : { ...bounds, height: maxHeight }
}

/** The output size: `PORTRAIT_HEIGHT` tall, keeping the proportions, never enlarged. */
export function getPortraitSize(crop: Pick<Rect, 'width' | 'height'>): {
  width: number
  height: number
} {
  const scale = Math.min(1, PORTRAIT_HEIGHT / crop.height)
  return {
    width: Math.max(1, Math.round(crop.width * scale)),
    height: Math.max(1, Math.round(crop.height * scale)),
  }
}
