import { z } from 'zod'

import type { BattingStyle, BowlingStyle, ClubOffice, PlayingRole } from '../types'

export const PLAYING_ROLES = [
  'batter',
  'bowler',
  'all-rounder',
  'wicketkeeper',
] as const satisfies readonly PlayingRole[]

export const BATTING_STYLES = ['right-hand', 'left-hand'] as const satisfies readonly BattingStyle[]

/** Pace first, then spin, as players think about them. */
export const BOWLING_STYLES = [
  'right-arm-fast',
  'left-arm-fast',
  'right-arm-medium',
  'left-arm-medium',
  'right-arm-off-spin',
  'right-arm-leg-spin',
  'left-arm-orthodox',
  'left-arm-wrist-spin',
] as const satisfies readonly BowlingStyle[]

export const CLUB_OFFICES = [
  'president',
  'vice-president',
  'treasurer',
  'secretary',
] as const satisfies readonly ClubOffice[]

export const NAME_MAX_LENGTH = 100
/** Matches the CMS field: a short introduction, not a biography. */
export const BIO_MAX_LENGTH = 400
export const CONSENT_NOTE_MAX_LENGTH = 200

/** Photos are shrunk in the browser first; this only stops oversized uploads that skipped that. */
export const PHOTO_MAX_BYTES = 3 * 1024 * 1024
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type PlayerFormErrorCode =
  'required' | 'tooLong' | 'consentNoteRequired' | 'photoType' | 'photoSize' | 'duplicateName'

/** Blank selects mean "not set". */
const optionalChoice = <T extends readonly [string, ...string[]]>(options: T) =>
  z.preprocess((value) => (value === '' ? null : value), z.enum(options).nullable())

const playerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'required' })
      .max(NAME_MAX_LENGTH, { error: 'tooLong' }),
    playingRole: optionalChoice(PLAYING_ROLES),
    battingStyle: optionalChoice(BATTING_STYLES),
    bowlingStyle: optionalChoice(BOWLING_STYLES),
    clubOffice: optionalChoice(CLUB_OFFICES),
    teams: z.array(z.coerce.number().int().positive()),
    bio: z
      .string()
      .trim()
      .max(BIO_MAX_LENGTH, { error: 'tooLong' })
      .transform((bio) => bio || null),
    isFeaturedOnHome: z.boolean(),
    hasPublishConsent: z.boolean(),
    consentNote: z
      .string()
      .trim()
      .max(CONSENT_NOTE_MAX_LENGTH, { error: 'tooLong' })
      .transform((note) => note || null),
  })
  // Consent must be traceable (GDPR Art. 7(1)), as the CMS also checks.
  .refine((player) => !player.hasPublishConsent || player.consentNote !== null, {
    error: 'consentNoteRequired',
    path: ['consentNote'],
  })

export type PlayerInput = z.infer<typeof playerFormSchema>
export type PlayerFormField = keyof PlayerInput | 'photo'
export type PlayerFieldErrors = Partial<Record<PlayerFormField, PlayerFormErrorCode>>

/** What to do with the photo: keep it, replace it with an upload, or remove it. */
export type PhotoChange = { kind: 'keep' } | { kind: 'replace'; file: File } | { kind: 'remove' }

export type PlayerFormParseResult =
  | { success: true; player: PlayerInput; photo: PhotoChange; id: number | null }
  | { success: false; fieldErrors: PlayerFieldErrors }

const ERROR_CODES: readonly PlayerFormErrorCode[] = [
  'required',
  'tooLong',
  'consentNoteRequired',
  'photoType',
  'photoSize',
  'duplicateName',
]
const FIELDS: readonly PlayerFormField[] = [
  'name',
  'playingRole',
  'battingStyle',
  'bowlingStyle',
  'clubOffice',
  'teams',
  'bio',
  'isFeaturedOnHome',
  'hasPublishConsent',
  'consentNote',
  'photo',
]

function isField(key: PropertyKey | undefined): key is PlayerFormField {
  return typeof key === 'string' && FIELDS.some((field) => field === key)
}

function toErrorCode(message: string): PlayerFormErrorCode {
  return ERROR_CODES.find((code) => code === message) ?? 'required'
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function isPhotoType(type: string): boolean {
  return PHOTO_TYPES.some((photoType) => photoType === type)
}

function readPhoto(formData: FormData): PhotoChange | PlayerFormErrorCode {
  if (formData.get('removePhoto') === 'on') {
    return { kind: 'remove' }
  }

  const file = formData.get('photo')
  // An empty file input still submits a nameless, empty file.
  if (!(file instanceof File) || file.size === 0) {
    return { kind: 'keep' }
  }
  if (!isPhotoType(file.type)) {
    return 'photoType'
  }

  return file.size > PHOTO_MAX_BYTES ? 'photoSize' : { kind: 'replace', file }
}

function readId(formData: FormData): number | null {
  const id = Number(readText(formData, 'id'))
  return Number.isInteger(id) && id > 0 ? id : null
}

/** Validates the add/edit player form; errors are codes the form translates. */
export function parsePlayerForm(formData: FormData): PlayerFormParseResult {
  const parsed = playerFormSchema.safeParse({
    name: readText(formData, 'name'),
    playingRole: readText(formData, 'playingRole'),
    battingStyle: readText(formData, 'battingStyle'),
    bowlingStyle: readText(formData, 'bowlingStyle'),
    clubOffice: readText(formData, 'clubOffice'),
    teams: formData.getAll('teams').filter((team) => typeof team === 'string'),
    bio: readText(formData, 'bio'),
    isFeaturedOnHome: formData.get('isFeaturedOnHome') === 'on',
    hasPublishConsent: formData.get('hasPublishConsent') === 'on',
    consentNote: readText(formData, 'consentNote'),
  })
  const photo = readPhoto(formData)

  const fieldErrors: PlayerFieldErrors = {}
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const [field] = issue.path
      if (isField(field) && !fieldErrors[field]) {
        fieldErrors[field] = toErrorCode(issue.message)
      }
    }
  }
  if (typeof photo === 'string') {
    fieldErrors.photo = photo
  }

  if (!parsed.success || typeof photo === 'string') {
    return { success: false, fieldErrors }
  }

  return { success: true, player: parsed.data, photo, id: readId(formData) }
}
