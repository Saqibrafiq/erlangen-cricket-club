import type { Tensor } from '@huggingface/transformers'

import {
  applyMatte,
  decontaminateEdges,
  estimateBackground,
  findVisibleBounds,
  getHeadAndShouldersCrop,
  getPortraitSize,
} from '../../domain/portrait'

/*
 * Removes a photo's background in the editor's browser and frames it like the other squad photos
 * (ADR-0016). MODNet (Apache-2.0) runs through transformers.js; the model and the ONNX runtime are
 * served from our own domain, so no request leaves the site. Loaded only when an editor picks a
 * photo, never for visitors.
 */

const MODEL_ID = 'Xenova/modnet'
/** Under `public/`: `models/` is committed, `onnx/` is copied in by scripts/copy-onnx-runtime.mjs. */
const MODEL_PATH = '/models/'
const ONNX_RUNTIME_FILES = {
  mjs: '/onnx/ort-wasm-simd-threaded.jsep.mjs',
  wasm: '/onnx/ort-wasm-simd-threaded.jsep.wasm',
}
/** Phone photos are scaled to this first: plenty for a 720 px portrait, and much faster. */
const MAX_INPUT_EDGE = 2048
const WEBP_QUALITY = 0.9

type Matting = Awaited<ReturnType<typeof loadMatting>>

async function loadMatting() {
  const { AutoModel, AutoProcessor, RawImage, Tensor, env } =
    await import('@huggingface/transformers')
  env.allowRemoteModels = false
  env.allowLocalModels = true
  env.localModelPath = MODEL_PATH
  const { onnx } = env.backends
  if (onnx.wasm) {
    onnx.wasm.wasmPaths = ONNX_RUNTIME_FILES
  }
  const [model, processor] = await Promise.all([
    AutoModel.from_pretrained(MODEL_ID, { dtype: 'q8' }),
    AutoProcessor.from_pretrained(MODEL_ID),
  ])
  return { model, processor, RawImage, Tensor }
}

let matting: Promise<Matting> | null = null

/** Loads the model once per page; a failed load is retried on the next photo. */
function getMatting(): Promise<Matting> {
  matting ??= loadMatting().catch((error: unknown) => {
    matting = null
    throw error
  })
  return matting
}

function createContext(width: number, height: number): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    throw new Error('Canvas 2D is not available')
  }
  return context
}

/** Draws the photo (upright, per its EXIF orientation) at most `MAX_INPUT_EDGE` px wide or tall. */
async function drawPhoto(file: File): Promise<CanvasRenderingContext2D> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_INPUT_EDGE / Math.max(bitmap.width, bitmap.height))
  const context = createContext(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale))
  context.drawImage(bitmap, 0, 0, context.canvas.width, context.canvas.height)
  bitmap.close()
  return context
}

/** The tensor under `key` in a model or processor result (typed `any` by the library). */
function readTensor(result: unknown, key: string, TensorClass: typeof Tensor): Tensor {
  const value: unknown =
    typeof result === 'object' && result !== null ? Reflect.get(result, key) : null
  if (!(value instanceof TensorClass)) {
    throw new Error(`Unexpected model result: no tensor "${key}"`)
  }
  return value
}

/** The model's matte (0–255 per pixel) at the photo's size. */
async function predictMatte(
  { model, processor, RawImage, Tensor }: Matting,
  pixels: ImageData,
): Promise<ArrayLike<number>> {
  const image = new RawImage(pixels.data, pixels.width, pixels.height, 4).rgb()
  const processed: unknown = await processor(image)
  const result: unknown = await model({ input: readTensor(processed, 'pixel_values', Tensor) })
  // [1, 1, height, width] → one channel of 0–255.
  const output = readTensor(result, 'output', Tensor).squeeze(0).mul(255).to('uint8')
  const matte = await RawImage.fromTensor(output).resize(pixels.width, pixels.height)
  return matte.data
}

function toWebp(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob?.type === 'image/webp') resolve(blob)
        else reject(new Error('WebP encoding is not available'))
      },
      'image/webp',
      WEBP_QUALITY,
    )
  })
}

/**
 * The player cut out of `file`: transparent background without colour fringes, cropped to head
 * and shoulders, 720 px tall, as WebP. Throws when the browser can't do it or no person is found;
 * the form then uploads the photo as it is.
 */
export async function cutOutPortrait(file: File): Promise<File> {
  const [loaded, context] = await Promise.all([getMatting(), drawPhoto(file)])
  const { width, height } = context.canvas
  const pixels = context.getImageData(0, 0, width, height)

  const matte = await predictMatte(loaded, pixels)
  const background = estimateBackground(pixels.data, matte)
  applyMatte(pixels.data, matte)
  if (background) {
    decontaminateEdges(pixels.data, background)
  }
  const bounds = findVisibleBounds(pixels.data, width, height)
  if (!bounds) {
    throw new Error('No person found in the photo')
  }
  context.putImageData(pixels, 0, 0)

  const crop = getHeadAndShouldersCrop(bounds)
  const size = getPortraitSize(crop)
  const output = createContext(size.width, size.height)
  output.drawImage(
    context.canvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size.width,
    size.height,
  )

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([await toWebp(output.canvas)], `${baseName}.webp`, { type: 'image/webp' })
}
