import { useState } from 'react'

import { resizeImage } from '@/shared/lib/resize-image'

import type { EditorImage, NewsEditorActions } from '../../editor-types'

export type ImageError = 'imageType' | 'imageSize' | 'imageUpload' | 'unauthorized'

type Progress = { done: number; total: number }

export type ArticleImagesOptions = {
  initialFeatured: EditorImage | null
  initialGallery: readonly EditorImage[]
  upload: NewsEditorActions['uploadImage']
  locale: string
  /** Describes the images for people who can't see them (the article title). */
  getAlt: () => string
}

/**
 * The article's main image and gallery. Each chosen photo is shrunk and uploaded right away, one
 * request per photo (well below the request size limit); the article then references the ids.
 */
export function useArticleImages({
  initialFeatured,
  initialGallery,
  upload,
  locale,
  getAlt,
}: ArticleImagesOptions) {
  const [featured, setFeatured] = useState<EditorImage | null>(initialFeatured)
  const [gallery, setGallery] = useState<EditorImage[]>([...initialGallery])
  const [progress, setProgress] = useState<Progress | null>(null)
  const [error, setError] = useState<ImageError | null>(null)

  async function uploadOne(file: File): Promise<EditorImage | null> {
    const formData = new FormData()
    formData.set('image', await resizeImage(file))
    formData.set('alt', getAlt())
    formData.set('locale', locale)
    const result = await upload(formData)
    switch (result.status) {
      case 'ok':
        return result.image
      case 'invalid':
        setError(result.reason === 'size' ? 'imageSize' : 'imageType')
        return null
      case 'unauthorized':
        setError('unauthorized')
        return null
      default:
        setError('imageUpload')
        return null
    }
  }

  async function uploadAll(files: readonly File[], onUploaded: (image: EditorImage) => void) {
    setError(null)
    setProgress({ done: 0, total: files.length })
    for (const [index, file] of files.entries()) {
      const image = await uploadOne(file)
      if (image) {
        onUploaded(image)
      }
      setProgress({ done: index + 1, total: files.length })
    }
    setProgress(null)
  }

  return {
    featured,
    gallery,
    progress,
    error,
    isUploading: progress !== null,
    async chooseFeatured(file: File) {
      await uploadAll([file], setFeatured)
    },
    removeFeatured() {
      setFeatured(null)
    },
    async addToGallery(files: readonly File[]) {
      await uploadAll(files, (image) => {
        setGallery((images) => [...images, image])
      })
    },
    removeFromGallery(id: number) {
      setGallery((images) => images.filter((image) => image.id !== id))
    },
  }
}
