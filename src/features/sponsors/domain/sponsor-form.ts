import { z } from 'zod'

import { checkImageUpload } from '@/shared/config/image-upload'

import type { SponsorTier } from '../types'

export const SPONSOR_TIERS = ['title', 'sponsor'] as const satisfies readonly SponsorTier[]

export const NAME_MAX_LENGTH = 100
/** One or two sentences, as on the card. */
export const DESCRIPTION_MAX_LENGTH = 400
/** Matches the CMS field. */
export const FIRST_SPONSOR_YEAR = 2000
export const LAST_SPONSOR_YEAR = 2100
const WEBSITE_PREFIX = 'https://'

export type SponsorFormErrorCode =
  'required' | 'tooLong' | 'year' | 'website' | 'logoRequired' | 'logoType' | 'logoSize'

const requiredText = (maxLength: number) =>
  z.string().trim().min(1, { error: 'required' }).max(maxLength, { error: 'tooLong' })

const sponsorFormSchema = z.object({
  name: requiredText(NAME_MAX_LENGTH),
  tier: z.enum(SPONSOR_TIERS, { error: 'required' }),
  since: z.coerce
    .number({ error: 'year' })
    .int({ error: 'year' })
    .min(FIRST_SPONSOR_YEAR, { error: 'year' })
    .max(LAST_SPONSOR_YEAR, { error: 'year' }),
  // The card is shown in both languages, so both are asked for together.
  descriptionEn: requiredText(DESCRIPTION_MAX_LENGTH),
  descriptionDe: requiredText(DESCRIPTION_MAX_LENGTH),
  website: z
    .string()
    .trim()
    .refine((url) => url === '' || (url.startsWith(WEBSITE_PREFIX) && URL.canParse(url)), {
      error: 'website',
    })
    .transform((url) => url || null),
  isActive: z.boolean(),
})

export type SponsorInput = z.infer<typeof sponsorFormSchema>
export type SponsorFormField = keyof SponsorInput | 'logo'
export type SponsorFieldErrors = Partial<Record<SponsorFormField, SponsorFormErrorCode>>

/** Keep the logo, or replace it with an upload. A sponsor always has one. */
export type LogoChange = { kind: 'keep' } | { kind: 'replace'; file: File }

export type SponsorFormParseResult =
  | { success: true; sponsor: SponsorInput; logo: LogoChange; id: number | null }
  | { success: false; fieldErrors: SponsorFieldErrors }

const ERROR_CODES: readonly SponsorFormErrorCode[] = [
  'required',
  'tooLong',
  'year',
  'website',
  'logoRequired',
  'logoType',
  'logoSize',
]
const FIELDS: readonly SponsorFormField[] = [
  'name',
  'tier',
  'since',
  'descriptionEn',
  'descriptionDe',
  'website',
  'isActive',
  'logo',
]

function isField(key: PropertyKey | undefined): key is SponsorFormField {
  return typeof key === 'string' && FIELDS.some((field) => field === key)
}

function toErrorCode(message: string): SponsorFormErrorCode {
  return ERROR_CODES.find((code) => code === message) ?? 'required'
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function readId(formData: FormData): number | null {
  const id = Number(readText(formData, 'id'))
  return Number.isInteger(id) && id > 0 ? id : null
}

function readLogo(formData: FormData, isNew: boolean): LogoChange | SponsorFormErrorCode {
  const file = formData.get('logo')
  // An empty file input still submits a nameless, empty file.
  if (!(file instanceof File) || file.size === 0) {
    return isNew ? 'logoRequired' : { kind: 'keep' }
  }
  const problem = checkImageUpload(file)
  if (problem === 'type') {
    return 'logoType'
  }
  return problem === 'size' ? 'logoSize' : { kind: 'replace', file }
}

/** Validates the add/edit sponsor form; errors are codes the form translates. */
export function parseSponsorForm(formData: FormData): SponsorFormParseResult {
  const id = readId(formData)
  const parsed = sponsorFormSchema.safeParse({
    name: readText(formData, 'name'),
    tier: readText(formData, 'tier'),
    // Blank must fail as a year, not coerce to 0 silently passing as "missing".
    since: readText(formData, 'since') || undefined,
    descriptionEn: readText(formData, 'descriptionEn'),
    descriptionDe: readText(formData, 'descriptionDe'),
    website: readText(formData, 'website'),
    isActive: formData.get('isActive') === 'on',
  })
  const logo = readLogo(formData, id === null)

  const fieldErrors: SponsorFieldErrors = {}
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const [field] = issue.path
      if (isField(field) && !fieldErrors[field]) {
        fieldErrors[field] = toErrorCode(issue.message)
      }
    }
  }
  if (typeof logo === 'string') {
    fieldErrors.logo = logo
  }

  if (!parsed.success || typeof logo === 'string') {
    return { success: false, fieldErrors }
  }
  return { success: true, sponsor: parsed.data, logo, id }
}
