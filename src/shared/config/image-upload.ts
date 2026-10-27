/** Image types editors may upload (player photos, article images). */
export const IMAGE_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/**
 * Images are shrunk in the browser first; this only stops oversized uploads that skipped that.
 * Below the 4 MB server action limit (next.config.ts) and Vercel's 4.5 MB request limit.
 */
export const IMAGE_UPLOAD_MAX_BYTES = 3 * 1024 * 1024

export type ImageUploadProblem = 'type' | 'size'

/** Why `file` can't be uploaded as an image, or `null` if it can. */
export function checkImageUpload(file: Pick<File, 'type' | 'size'>): ImageUploadProblem | null {
  if (!IMAGE_UPLOAD_TYPES.some((type) => type === file.type)) {
    return 'type'
  }
  return file.size > IMAGE_UPLOAD_MAX_BYTES ? 'size' : null
}
