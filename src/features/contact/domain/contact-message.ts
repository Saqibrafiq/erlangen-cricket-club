import { z } from 'zod'

import { routing } from '@/i18n/routing'
import type { ContactMessage } from '@/payload-types'

export const CONTACT_TOPICS = [
  'membership',
  'sponsorship',
  'matches',
  'other',
] as const satisfies readonly ContactMessage['topic'][]

export type ContactTopic = (typeof CONTACT_TOPICS)[number]

export const NAME_MAX_LENGTH = 100
export const MESSAGE_MAX_LENGTH = 1000

/** Hidden field that people never see or fill in; bots that fill every field reveal themselves. */
export const HONEYPOT_FIELD = 'website'

export type ContactErrorCode = 'required' | 'invalidEmail' | 'tooLong'

const contactMessageSchema = z.object({
  name: z.string().trim().min(1, { error: 'required' }).max(NAME_MAX_LENGTH, { error: 'tooLong' }),
  email: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .pipe(z.email({ error: 'invalidEmail' })),
  topic: z.enum(CONTACT_TOPICS, { error: 'required' }),
  message: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(MESSAGE_MAX_LENGTH, { error: 'tooLong' }),
  locale: z.enum(routing.locales),
})

export type ContactMessageInput = z.infer<typeof contactMessageSchema>
export type ContactField = Exclude<keyof ContactMessageInput, 'locale'>

/** What the visitor typed, kept so an invalid form can be shown again filled in. */
export type ContactValues = Partial<Record<ContactField, string>>

export type ContactParseResult =
  | { success: true; message: ContactMessageInput }
  | {
      success: false
      fieldErrors: Partial<Record<ContactField, ContactErrorCode>>
      values: ContactValues
    }

const CONTACT_FIELDS: readonly ContactField[] = ['name', 'email', 'topic', 'message']
const ERROR_CODES: readonly ContactErrorCode[] = ['required', 'invalidEmail', 'tooLong']

function isContactField(key: PropertyKey | undefined): key is ContactField {
  return typeof key === 'string' && CONTACT_FIELDS.some((field) => field === key)
}

function toErrorCode(message: string): ContactErrorCode {
  return ERROR_CODES.find((code) => code === message) ?? 'required'
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

/** True when the hidden honeypot field was filled in, i.e. the sender is almost certainly a bot. */
export function isSpam(formData: FormData): boolean {
  return readField(formData, HONEYPOT_FIELD).trim() !== ''
}

/** Validates a submitted contact form; errors are codes the form translates. */
export function parseContactMessage(formData: FormData): ContactParseResult {
  const values: ContactValues = Object.fromEntries(
    CONTACT_FIELDS.map((field) => [field, readField(formData, field)]),
  )
  const parsed = contactMessageSchema.safeParse({
    ...values,
    locale: readField(formData, 'locale'),
  })

  if (parsed.success) {
    return { success: true, message: parsed.data }
  }

  const fieldErrors: Partial<Record<ContactField, ContactErrorCode>> = {}
  for (const issue of parsed.error.issues) {
    const [field] = issue.path
    if (isContactField(field) && !fieldErrors[field]) {
      fieldErrors[field] = toErrorCode(issue.message)
    }
  }

  return { success: false, fieldErrors, values }
}
