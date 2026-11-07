import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { ImageResponse } from 'next/og'
import sharp from 'sharp'

/*
 * Server-only helpers for images drawn with next/og (Satori): the club's fonts and crest, and
 * player photos in a format Satori can draw. Used by the Instagram graphics and the share cards.
 * Routes that use them need `src/shared/assets` in their file trace (next.config.ts).
 */

const ASSETS_DIR = path.join(process.cwd(), 'src/shared/assets')

export type BrandFonts = NonNullable<
  NonNullable<ConstructorParameters<typeof ImageResponse>[1]>['fonts']
>

export type BrandImageAssets = {
  /** The crest as a data URL. */
  crestSrc: string
  fonts: BrandFonts
}

// Loaded once per server instance: fonts and crest never change at runtime.
let assets: Promise<BrandImageAssets> | undefined

async function readAssets(): Promise<BrandImageAssets> {
  const read = (file: string) => readFile(path.join(ASSETS_DIR, file))
  const [crest, condensedBold, condensedSemiBold, medium] = await Promise.all([
    read('ecc-logo.png'),
    read('fonts/BarlowCondensed-Bold.ttf'),
    read('fonts/BarlowCondensed-SemiBold.ttf'),
    read('fonts/Barlow-Medium.ttf'),
  ])

  return {
    crestSrc: `data:image/png;base64,${crest.toString('base64')}`,
    fonts: [
      { name: 'Barlow Condensed', data: condensedBold, weight: 700, style: 'normal' },
      { name: 'Barlow Condensed', data: condensedSemiBold, weight: 600, style: 'normal' },
      { name: 'Barlow', data: medium, weight: 500, style: 'normal' },
    ],
  }
}

/** The club's fonts and crest for next/og images, read once per server instance. */
export function loadBrandImageAssets(): Promise<BrandImageAssets> {
  assets ??= readAssets()
  return assets
}

/**
 * A photo as a PNG data URL: Satori draws PNG and JPEG, not the WebP player cut-outs.
 *
 * @returns The data URL, or `null` when the photo cannot be fetched.
 */
export async function loadPhotoAsPng(url: string, origin: string): Promise<string | null> {
  const response = await fetch(new URL(url, origin))
  if (!response.ok) {
    return null
  }
  const png = await sharp(Buffer.from(await response.arrayBuffer()))
    .png()
    .toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}
