import { z } from 'zod'

import type { NewsImageStyle } from '../types'
import {
  isEditableOnWebsite,
  isRichTextDocument,
  isRichTextEmpty,
  type RichTextDocument,
} from './rich-text'

export const TITLE_MAX_LENGTH = 160
/** Matches the CMS field: long enough for a teaser, short enough for search-result snippets. */
export const EXCERPT_MAX_LENGTH = 300
export const IMAGE_STYLES = ['photo', 'logo'] as const satisfies readonly NewsImageStyle[]

/** Payload stores day-only dates at noon UTC, so they never shift across time zones. */
const DAY_ONLY_TIME = 'T12:00:00.000Z'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export type NewsStatus = 'published' | 'draft'

export type NewsFormErrorCode = 'required' | 'tooLong' | 'invalidDate' | 'duplicateTitle'

function isValidDay(value: string): boolean {
  return DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(`${value}${DAY_ONLY_TIME}`))
}

const newsFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(TITLE_MAX_LENGTH, { error: 'tooLong' }),
  excerpt: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(EXCERPT_MAX_LENGTH, { error: 'tooLong' }),
  publishedAt: z
    .string()
    .refine(isValidDay, { error: 'invalidDate' })
    .transform((day) => `${day}${DAY_ONLY_TIME}`),
  featuredImage: z.preprocess(
    (value) => (value === '' ? null : value),
    z.coerce.number().int().positive().nullable(),
  ),
  featuredImageStyle: z.enum(IMAGE_STYLES),
  gallery: z.array(z.coerce.number().int().positive()),
  status: z.enum(['published', 'draft']),
})

export type NewsInput = z.infer<typeof newsFormSchema> & {
  /** `null` keeps the stored text (it holds content only the admin can edit). */
  body: RichTextDocument | null
}
export type NewsFormField = keyof NewsInput
export type NewsFieldErrors = Partial<Record<NewsFormField, NewsFormErrorCode>>

export type NewsFormParseResult =
  | { success: true; article: NewsInput; id: number | null }
  | { success: false; fieldErrors: NewsFieldErrors }

const ERROR_CODES: readonly NewsFormErrorCode[] = ['required', 'tooLong', 'invalidDate']
const FIELDS: readonly NewsFormField[] = [
  'title',
  'excerpt',
  'publishedAt',
  'featuredImage',
  'featuredImageStyle',
  'gallery',
  'status',
]

function isField(key: PropertyKey | undefined): key is NewsFormField {
  return typeof key === 'string' && FIELDS.some((field) => field === key)
}

function toErrorCode(message: string): NewsFormErrorCode {
  return ERROR_CODES.find((code) => code === message) ?? 'required'
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

/** The article text from the form: `null` to keep it, a document, or an error code. */
function readBody(formData: FormData): RichTextDocument | null | NewsFormErrorCode {
  const raw = formData.get('body')
  if (raw === null) {
    return null
  }

  let parsed: unknown = null
  try {
    parsed = JSON.parse(typeof raw === 'string' ? raw : '')
  } catch {
    return 'required'
  }
  // Only what the website editor can produce is accepted, so a crafted request can't add more.
  if (!isRichTextDocument(parsed) || !isEditableOnWebsite(parsed) || isRichTextEmpty(parsed)) {
    return 'required'
  }
  return parsed
}

function readId(formData: FormData): number | null {
  const id = Number(readText(formData, 'id'))
  return Number.isInteger(id) && id > 0 ? id : null
}

/**
 * Validates the article form. The text arrives as the editor's JSON, or not at all when it is
 * read-only (kept as stored). Errors are codes the form translates.
 */
export function parseNewsForm(formData: FormData): NewsFormParseResult {
  const parsed = newsFormSchema.safeParse({
    title: readText(formData, 'title'),
    excerpt: readText(formData, 'excerpt'),
    publishedAt: readText(formData, 'publishedAt'),
    featuredImage: readText(formData, 'featuredImage'),
    featuredImageStyle: readText(formData, 'featuredImageStyle') || 'photo',
    gallery: formData.getAll('gallery').filter((image) => typeof image === 'string'),
    status: readText(formData, 'status'),
  })
  const body = readBody(formData)

  const fieldErrors: NewsFieldErrors = {}
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const [field] = issue.path
      if (isField(field) && !fieldErrors[field]) {
        fieldErrors[field] = toErrorCode(issue.message)
      }
    }
  }
  if (typeof body === 'string') {
    fieldErrors.body = body
  }

  if (!parsed.success || typeof body === 'string') {
    return { success: false, fieldErrors }
  }
  return { success: true, article: { ...parsed.data, body }, id: readId(formData) }
}

const DAY_LENGTH = 'YYYY-MM-DD'.length

/** `YYYY-MM-DD` of a stored date, for the date field (dates are stored at noon UTC). */
export function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, DAY_LENGTH)
}
