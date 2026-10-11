'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload, type Payload, type TypedUser, ValidationError } from 'payload'

import { routing, type Locale } from '@/i18n/routing'
import { slugify } from '@/shared/lib/slugify'

import { parsePlayerForm, type PhotoChange } from '../domain/player-form'
import type {
  DeletePlayerResult,
  EditorResult,
  HiddenPlayer,
  PlayerEditorData,
  SavePlayerResult,
} from '../editor-types'
import { mapPlayerDraft } from './map-player'

/*
 * Editing actions for signed-in editors. Server actions are public endpoints, so each one checks
 * the session itself and writes as that user with Payload's access control on
 * (`overrideAccess: false`): the edit-mode cookie on the page only decides what is shown.
 */

const PHOTO_EXTENSIONS: Record<string, string> = {
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

function getMediaId(photo: unknown): number | null {
  if (typeof photo === 'number') {
    return photo
  }
  if (typeof photo === 'object' && photo !== null && 'id' in photo && isId(photo.id)) {
    return photo.id
  }
  return null
}

/** Removes a photo nobody uses any more. A failure only leaves an unused file, so it is logged, not raised. */
async function deletePhotoQuietly({ payload, user }: Editor, id: number | null): Promise<void> {
  if (id === null) {
    return
  }
  try {
    await payload.delete({ collection: 'media', id, user, overrideAccess: false })
  } catch (error) {
    payload.logger.error({ err: error }, `Could not delete unused player photo ${String(id)}`)
  }
}

async function uploadPhoto(
  { payload, user }: Editor,
  file: File,
  playerName: string,
  locale: Locale,
): Promise<number> {
  const extension = PHOTO_EXTENSIONS[file.type] ?? 'jpg'
  const doc = await payload.create({
    collection: 'media',
    data: { alt: playerName },
    file: {
      data: Buffer.from(await file.arrayBuffer()),
      mimetype: file.type,
      name: `player-${slugify(playerName)}.${extension}`,
      size: file.size,
    },
    locale,
    user,
    overrideAccess: false,
  })
  return doc.id
}

/** The photo value to store: unchanged (`undefined`), a new upload's id, or removed (`null`). */
async function resolvePhoto(
  editor: Editor,
  change: PhotoChange,
  playerName: string,
  locale: Locale,
): Promise<number | null | undefined> {
  switch (change.kind) {
    case 'replace':
      return uploadPhoto(editor, change.file, playerName, locale)
    case 'remove':
      return null
    default:
      return undefined
  }
}

function isDuplicateSlug(error: unknown): boolean {
  return error instanceof ValidationError && error.data.errors.some(({ path }) => path === 'slug')
}

/** Club teams to pick from, and the player to edit (`id`) or `null` for a new one. */
export async function getPlayerEditorDataAction(
  id: number | null,
  localeValue: string,
): Promise<EditorResult<PlayerEditorData>> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const { payload, user } = editor
  const locale = toLocale(localeValue)

  try {
    const [teams, doc] = await Promise.all([
      payload.find({
        collection: 'teams',
        where: { isClubTeam: { equals: true } },
        sort: 'name',
        depth: 0,
        pagination: false,
        user,
        overrideAccess: false,
      }),
      isId(id)
        ? payload.findByID({
            collection: 'players',
            id,
            depth: 1,
            locale,
            user,
            overrideAccess: false,
          })
        : null,
    ])

    return {
      status: 'ok',
      data: {
        draft: doc && mapPlayerDraft(doc),
        teams: teams.docs.map((team) => ({ id: team.id, name: team.name })),
      },
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not load the player editor')
    return { status: 'error' }
  }
}

/** Players who are not shown publicly (no consent recorded), so editors can still find them. */
export async function getHiddenPlayersAction(): Promise<EditorResult<HiddenPlayer[]>> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const { payload, user } = editor

  try {
    const { docs } = await payload.find({
      collection: 'players',
      where: { hasPublishConsent: { not_equals: true } },
      sort: 'name',
      depth: 0,
      pagination: false,
      select: { name: true },
      user,
      overrideAccess: false,
    })
    return { status: 'ok', data: docs.map((doc) => ({ id: doc.id, name: doc.name })) }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not list hidden players')
    return { status: 'error' }
  }
}

/** Adds a player (no `id`) or updates one; a new photo replaces and deletes the old one. */
export async function savePlayerAction(formData: FormData): Promise<SavePlayerResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }

  const parsed = parsePlayerForm(formData)
  if (!parsed.success) {
    return { status: 'invalid', fieldErrors: parsed.fieldErrors }
  }

  const { payload, user } = editor
  const locale = toLocale(formData.get('locale'))
  const { id, player } = parsed
  let newPhotoId: number | null = null

  try {
    const existing =
      id === null
        ? null
        : await payload.findByID({
            collection: 'players',
            id,
            depth: 0,
            user,
            overrideAccess: false,
          })
    const photo = await resolvePhoto(editor, parsed.photo, player.name, locale)
    newPhotoId = photo ?? null
    const data = {
      ...player,
      // The URL follows the name, so a renamed player gets a matching address.
      slug: slugify(player.name),
      ...(photo === undefined ? {} : { photo }),
    }
    const doc =
      id === null
        ? await payload.create({ collection: 'players', data, locale, user, overrideAccess: false })
        : await payload.update({
            collection: 'players',
            id,
            data,
            locale,
            user,
            overrideAccess: false,
          })

    if (photo !== undefined) {
      await deletePhotoQuietly(editor, getMediaId(existing?.photo))
    }
    return {
      status: 'saved',
      player: { id: doc.id, slug: doc.slug, isPublic: doc.hasPublishConsent ?? false },
    }
  } catch (error) {
    // The player was not saved, so a photo uploaded for it would be left unused.
    await deletePhotoQuietly(editor, newPhotoId)
    if (isDuplicateSlug(error)) {
      return { status: 'invalid', fieldErrors: { name: 'duplicateName' } }
    }
    payload.logger.error({ err: error }, 'Could not save a player')
    return { status: 'error' }
  }
}

/** Deletes a player and their photo (GDPR: nothing of them stays behind). */
export async function deletePlayerAction(id: number): Promise<DeletePlayerResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  if (!isId(id)) {
    return { status: 'error' }
  }
  const { payload, user } = editor

  try {
    const doc = await payload.delete({
      collection: 'players',
      id,
      depth: 0,
      user,
      overrideAccess: false,
    })
    await deletePhotoQuietly(editor, getMediaId(doc.photo))
    return { status: 'deleted' }
  } catch (error) {
    payload.logger.error({ err: error }, `Could not delete player ${String(id)}`)
    return { status: 'error' }
  }
}
