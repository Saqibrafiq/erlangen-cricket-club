/** Longest edge a photo is scaled down to before upload; plenty for cards and profiles. */
export const MAX_IMAGE_EDGE = 1200
const WEBP_QUALITY = 0.85
const WEBP_TYPE = 'image/webp'

/**
 * Scales a photo down in the browser (keeping transparency) and re-encodes it as WebP, so phone
 * photos of several megabytes upload as a few hundred kilobytes. Falls back to the original file
 * where the browser cannot decode or encode it; the server still checks type and size.
 */
export async function resizeImage(file: File, maxEdge = MAX_IMAGE_EDGE): Promise<File> {
  if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    if (!context) {
      return file
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, WEBP_TYPE, WEBP_QUALITY)
    })
    // Browsers without WebP encoding fall back to PNG; keep the original then.
    if (blob?.type !== WEBP_TYPE) {
      return file
    }
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
    return new File([blob], `${baseName}.webp`, { type: WEBP_TYPE })
  } catch {
    // Undecodable image (e.g. HEIC in some browsers): upload as is and let the server decide.
    return file
  }
}
