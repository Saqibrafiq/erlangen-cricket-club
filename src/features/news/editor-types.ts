import type { NewsFieldErrors, NewsStatus } from './domain/news-form'
import type { RichTextDocument } from './domain/rich-text'
import type { NewsImage, NewsImageStyle } from './types'

/** An image in the media library, as the article editor shows and references it. */
export type EditorImage = NewsImage & { id: number }

/** An article as the editor sees it, drafts included, in the language being edited. */
export type NewsDraft = {
  id: number
  slug: string
  title: string
  excerpt: string
  /** As stored by Payload; see `isEditableOnWebsite` before editing it on the website. */
  body: RichTextDocument
  /** `YYYY-MM-DD`. */
  publishedAt: string
  featuredImage: EditorImage | null
  featuredImageStyle: NewsImageStyle
  gallery: EditorImage[]
  status: NewsStatus
}

/** Unpublished articles: invisible to visitors, listed for editors. */
export type DraftNews = {
  id: number
  title: string
}

type Unauthorized = { status: 'unauthorized' }
type Failed = { status: 'error' }

export type NewsEditorResult<T> = { status: 'ok'; data: T } | Unauthorized | Failed

export type UploadImageResult =
  | { status: 'ok'; image: EditorImage }
  | { status: 'invalid'; reason: 'type' | 'size' }
  | Unauthorized
  | Failed

export type SaveNewsResult =
  | { status: 'saved'; article: { id: number; slug: string; isPublished: boolean } }
  | { status: 'invalid'; fieldErrors: NewsFieldErrors }
  | Unauthorized
  | Failed

export type DeleteNewsResult = { status: 'deleted' } | Unauthorized | Failed

/** The server actions the editing controls call, passed in by the route (see `NEWS_EDITING`). */
export type NewsEditorActions = {
  getArticle: (id: number, locale: string) => Promise<NewsEditorResult<NewsDraft>>
  getDrafts: () => Promise<NewsEditorResult<DraftNews[]>>
  uploadImage: (formData: FormData) => Promise<UploadImageResult>
  saveArticle: (formData: FormData) => Promise<SaveNewsResult>
  deleteArticle: (id: number) => Promise<DeleteNewsResult>
}

export type NewsEditing = {
  actions: NewsEditorActions
  /** Where to sign in again when the session has ended. */
  loginHref: string
}
