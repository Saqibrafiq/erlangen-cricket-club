'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Payload, type TypedUser, ValidationError } from 'payload'

import { routing, type Locale } from '@/i18n/routing'
import { checkImageUpload } from '@/shared/config/image-upload'
import { slugify } from '@/shared/lib/slugify'

import { parseNewsForm } from '../domain/news-form'
import { fromEditorDocument } from '../domain/rich-text'
import type {
  DeleteNewsResult,
  DraftNews,
  NewsDraft,
  NewsEditorResult,
  SaveNewsResult,
  UploadImageResult,
} from '../editor-types'
import { mapNewsDraft, toEditorImage, toStoredBody } from './map-news'

/*
 * Editing actions for signed-in editors (ADR-0015). Server actions are public endpoints, so each
 * one checks the session itself and writes as that user with Payload's access control on.
 */

const COLLECTION = 'news'
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

type Editor = { payload: Payload; user: TypedUser }

async function getEditor(): Promise<Editor | null> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user ? { payload, user } : null
}

function toLocale(value: unknown): Locale {
  return routing.locales.find((locale) => locale === value) ?? routing.defaultLocale
}

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

function isDuplicateSlug(error: unknown): boolean {
  return error instanceof ValidationError && error.data.errors.some(({ path }) => path === 'slug')
}

/** One article with its latest draft, in `locale`, as the editor needs it. */
export async function getNewsArticleForEditingAction(
  id: number,
  localeValue: string,
): Promise<NewsEditorResult<NewsDraft>> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  if (!isId(id)) {
    return { status: 'error' }
  }
  const { payload, user } = editor

  try {
    const doc = await payload.findByID({
      collection: COLLECTION,
      id,
      // The newest version, even if it is an unpublished draft.
      draft: true,
      depth: 1,
      locale: toLocale(localeValue),
      user,
      overrideAccess: false,
    })
    return { status: 'ok', data: mapNewsDraft(doc) }
  } catch (error) {
    payload.logger.error({ err: error }, `Could not load article ${String(id)} for editing`)
    return { status: 'error' }
  }
}

/** Articles not published yet, newest first: invisible to visitors, listed for editors. */
export async function getDraftNewsAction(): Promise<NewsEditorResult<DraftNews[]>> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const { payload, user } = editor

  try {
    const { docs } = await payload.find({
      collection: COLLECTION,
      where: { _status: { equals: 'draft' } },
      draft: true,
      sort: '-updatedAt',
      depth: 0,
      pagination: false,
      select: { title: true },
      user,
      overrideAccess: false,
    })
    return { status: 'ok', data: docs.map((doc) => ({ id: doc.id, title: doc.title })) }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not list draft articles')
    return { status: 'error' }
  }
}

/**
 * Uploads one article image right away, so a gallery of many photos never has to fit into a
 * single request. The image can then be referenced when the article is saved.
 */
export async function uploadNewsImageAction(formData: FormData): Promise<UploadImageResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0) {
    return { status: 'invalid', reason: 'type' }
  }
  const problem = checkImageUpload(file)
  if (problem) {
    return { status: 'invalid', reason: problem }
  }

  const { payload, user } = editor
  const altValue = formData.get('alt')
  const alt = (typeof altValue === 'string' ? altValue.trim() : '') || 'Erlangen Cricket Club'
  try {
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: Buffer.from(await file.arrayBuffer()),
        mimetype: file.type,
        name: `news-${slugify(alt) || 'image'}.${IMAGE_EXTENSIONS[file.type] ?? 'jpg'}`,
        size: file.size,
      },
      locale: toLocale(formData.get('locale')),
      user,
      overrideAccess: false,
    })
    const image = toEditorImage(doc)
    return image ? { status: 'ok', image } : { status: 'error' }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not upload an article image')
    return { status: 'error' }
  }
}

/**
 * Publishes or saves a draft of an article. A new article is written in both languages, so it
 * shows on the English and German site alike; later edits change the language being edited.
 */
export async function saveNewsAction(formData: FormData): Promise<SaveNewsResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const parsed = parseNewsForm(formData)
  if (!parsed.success) {
    return { status: 'invalid', fieldErrors: parsed.fieldErrors }
  }

  const { id, article } = parsed
  const body = article.body && toStoredBody(fromEditorDocument(article.body))
  // Only an existing article may keep its stored text; a new one needs some.
  if (id === null && !body) {
    return { status: 'invalid', fieldErrors: { body: 'required' } }
  }

  const { payload, user } = editor
  const locale = toLocale(formData.get('locale'))
  const isDraft = article.status === 'draft'
  const fields = {
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
    featuredImage: article.featuredImage,
    featuredImageStyle: article.featuredImageStyle,
    gallery: article.gallery,
    _status: article.status,
  }
  const options = { collection: COLLECTION, draft: isDraft, user, overrideAccess: false } as const

  try {
    let doc
    if (id !== null) {
      doc = await payload.update({
        ...options,
        id,
        locale,
        data: body ? { ...fields, body } : fields,
      })
    } else if (body) {
      // The URL comes from the title once and then stays, so shared links keep working.
      const created = { ...fields, body, slug: slugify(article.title) }
      doc = await payload.create({ ...options, locale, data: created })
      for (const other of routing.locales.filter((each) => each !== locale)) {
        await payload.update({ ...options, id: doc.id, locale: other, data: created })
      }
    } else {
      return { status: 'invalid', fieldErrors: { body: 'required' } }
    }
    return {
      status: 'saved',
      article: { id: doc.id, slug: doc.slug, isPublished: !isDraft },
    }
  } catch (error) {
    if (isDuplicateSlug(error)) {
      return { status: 'invalid', fieldErrors: { title: 'duplicateTitle' } }
    }
    payload.logger.error({ err: error }, 'Could not save an article')
    return { status: 'error' }
  }
}

/**
 * Deletes an article. Its images stay in the media library: they may be used elsewhere (e.g. the
 * journey page reuses news photos).
 */
export async function deleteNewsAction(id: number): Promise<DeleteNewsResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  if (!isId(id)) {
    return { status: 'error' }
  }
  const { payload, user } = editor

  try {
    await payload.delete({ collection: COLLECTION, id, user, overrideAccess: false })
    return { status: 'deleted' }
  } catch (error) {
    payload.logger.error({ err: error }, `Could not delete article ${String(id)}`)
    return { status: 'error' }
  }
}
