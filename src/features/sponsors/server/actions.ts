'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Payload, type TypedUser } from 'payload'

import { slugify } from '@/shared/lib/slugify'

import { parseSponsorForm } from '../domain/sponsor-form'
import type {
  DeleteSponsorResult,
  InactiveSponsor,
  SaveSponsorResult,
  SponsorDraft,
  SponsorEditorResult,
} from '../editor-types'
import { mapSponsorDraft } from './map-sponsor'

/*
 * Editing actions for signed-in editors. Server actions are public endpoints, so each one checks
 * the session itself and writes as that user with Payload's access control on
 * (`overrideAccess: false`): the edit-mode cookie on the page only decides what is shown.
 *
 * Logos stay in the media library when a sponsor is deleted or gets a new logo: news articles may
 * show the same image, and a logo is a few kilobytes.
 */

const LOGO_EXTENSIONS: Record<string, string> = {
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

function isId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

async function uploadLogo({ payload, user }: Editor, file: File, name: string): Promise<number> {
  const extension = LOGO_EXTENSIONS[file.type] ?? 'png'
  const doc = await payload.create({
    collection: 'media',
    data: { alt: `${name} logo` },
    file: {
      data: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type,
      name: `sponsor-${slugify(name)}.${extension}`,
      size: file.size,
    },
    user,
    overrideAccess: false,
  })
  return doc.id
}

/** A sponsor with both descriptions, for the edit form. */
export async function getSponsorAction(id: number): Promise<SponsorEditorResult<SponsorDraft>> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  if (!isId(id)) {
    return { status: 'error' }
  }
  const { payload, user } = editor

  try {
    const read = (locale: 'en' | 'de') =>
      payload.findByID({
        collection: 'sponsors',
        id,
        depth: 1,
        locale,
        // An untranslated description stays empty instead of showing the English one.
        fallbackLocale: false,
        user,
        overrideAccess: false,
      })
    const [english, german] = await Promise.all([read('en'), read('de')])
    // Without fallback an untranslated description is null, which the generated types don't model.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return { status: 'ok', data: mapSponsorDraft(english, german.description ?? '') }
  } catch (error) {
    payload.logger.error({ err: error }, `Could not load sponsor ${String(id)}`)
    return { status: 'error' }
  }
}

/** Sponsors not shown on the website (sponsorship ended), so editors can bring them back. */
export async function getInactiveSponsorsAction(): Promise<SponsorEditorResult<InactiveSponsor[]>> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const { payload, user } = editor

  try {
    const { docs } = await payload.find({
      collection: 'sponsors',
      where: { isActive: { not_equals: true } },
      sort: 'name',
      depth: 0,
      pagination: false,
      select: { name: true },
      user,
      overrideAccess: false,
    })
    return { status: 'ok', data: docs.map((doc) => ({ id: doc.id, name: doc.name })) }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not list inactive sponsors')
    return { status: 'error' }
  }
}

/** Adds a sponsor (no `id`) or updates one, in English and German at once. */
export async function saveSponsorAction(formData: FormData): Promise<SaveSponsorResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }

  const parsed = parseSponsorForm(formData)
  if (!parsed.success) {
    return { status: 'invalid', fieldErrors: parsed.fieldErrors }
  }

  const { payload, user } = editor
  const { id, logo } = parsed
  const { descriptionEn, descriptionDe, ...sponsor } = parsed.sponsor

  try {
    const data = { ...sponsor, description: descriptionEn }
    let doc
    if (logo.kind === 'replace') {
      const withLogo = { ...data, logo: await uploadLogo(editor, logo.file, sponsor.name) }
      doc =
        id === null
          ? await payload.create({
              collection: 'sponsors',
              data: withLogo,
              locale: 'en',
              user,
              overrideAccess: false,
            })
          : await payload.update({
              collection: 'sponsors',
              id,
              data: withLogo,
              locale: 'en',
              user,
              overrideAccess: false,
            })
    } else if (id === null) {
      // parseSponsorForm already requires a logo for a new sponsor.
      return { status: 'invalid', fieldErrors: { logo: 'logoRequired' } }
    } else {
      doc = await payload.update({
        collection: 'sponsors',
        id,
        data,
        locale: 'en',
        user,
        overrideAccess: false,
      })
    }
    await payload.update({
      collection: 'sponsors',
      id: doc.id,
      data: { description: descriptionDe },
      locale: 'de',
      user,
      overrideAccess: false,
    })
    return { status: 'saved', sponsor: { id: doc.id, isActive: doc.isActive ?? false } }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not save a sponsor')
    return { status: 'error' }
  }
}

export async function deleteSponsorAction(id: number): Promise<DeleteSponsorResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  if (!isId(id)) {
    return { status: 'error' }
  }
  const { payload, user } = editor

  try {
    await payload.delete({ collection: 'sponsors', id, depth: 0, user, overrideAccess: false })
    return { status: 'deleted' }
  } catch (error) {
    payload.logger.error({ err: error }, `Could not delete sponsor ${String(id)}`)
    return { status: 'error' }
  }
}
