import type { News } from '@/payload-types'

export type NewsImage = {
  /** Site-relative ("/api/media/file/…") or absolute URL. */
  url: string
  alt: string
  width: number
  height: number
}

/** "photo" fills its frame; "logo" (e.g. a sponsor's) is shown whole on a light panel. */
export type NewsImageStyle = 'photo' | 'logo'

export type NewsSummary = {
  id: number
  slug: string
  title: string
  excerpt: string
  /** ISO timestamp. */
  publishedAt: string
  image: NewsImage | null
  imageStyle: NewsImageStyle
}

export type NewsArticle = NewsSummary & {
  /** Rich text as stored by Payload. */
  body: News['body']
  gallery: readonly NewsImage[]
  /** ISO timestamp of the last edit. */
  updatedAt: string
}
