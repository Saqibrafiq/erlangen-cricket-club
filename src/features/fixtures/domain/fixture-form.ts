import { z } from 'zod'

import type { FixtureStage, FixtureStatus } from '../types'

export const EDITABLE_STAGES = [
  'league',
  'qualifier',
  'semi-final',
  'final',
] as const satisfies readonly FixtureStage[]

/** What an editor can set on the website; results (completed) are entered in the admin. */
export const EDITABLE_STATUSES = [
  'scheduled',
  'cancelled',
  'abandoned',
] as const satisfies readonly FixtureStatus[]

export type FixtureFormErrorCode = 'required' | 'date' | 'time'

const DAY = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

const fixtureFormSchema = z.object({
  id: z.coerce.number().int().positive(),
  day: z
    .string()
    .regex(DAY, { error: 'date' })
    .refine((day) => !Number.isNaN(Date.parse(`${day}T12:00:00Z`)), { error: 'date' }),
  // Browsers send "" for an empty time input.
  startTime: z
    .string()
    .refine((time) => time === '' || TIME.test(time), { error: 'time' })
    .transform((time) => time || null),
  ground: z
    .string()
    .transform((ground) => (ground === '' ? null : Number(ground)))
    .refine((ground) => ground === null || (Number.isInteger(ground) && ground > 0), {
      error: 'required',
    }),
  stage: z.enum(EDITABLE_STAGES, { error: 'required' }),
  // Absent for a played fixture: its status and result stay as they are.
  status: z.enum(EDITABLE_STATUSES, { error: 'required' }).optional(),
})

export type FixtureInput = z.infer<typeof fixtureFormSchema>
export type FixtureFormField = Exclude<keyof FixtureInput, 'id'>
export type FixtureFieldErrors = Partial<Record<FixtureFormField, FixtureFormErrorCode>>

export type FixtureFormParseResult =
  { success: true; fixture: FixtureInput } | { success: false; fieldErrors: FixtureFieldErrors }

const FIELDS: readonly FixtureFormField[] = ['day', 'startTime', 'ground', 'stage', 'status']
const ERROR_CODES: readonly FixtureFormErrorCode[] = ['required', 'date', 'time']

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

/** Validates the edit fixture form; errors are codes the form translates. */
export function parseFixtureForm(formData: FormData): FixtureFormParseResult {
  const status = formData.get('status')
  const parsed = fixtureFormSchema.safeParse({
    id: readText(formData, 'id'),
    day: readText(formData, 'day'),
    startTime: readText(formData, 'startTime'),
    ground: readText(formData, 'ground'),
    stage: readText(formData, 'stage'),
    status: typeof status === 'string' ? status : undefined,
  })
  if (parsed.success) {
    return { success: true, fixture: parsed.data }
  }

  const fieldErrors: FixtureFieldErrors = {}
  for (const issue of parsed.error.issues) {
    const [field] = issue.path
    const match = FIELDS.find((name) => name === field)
    if (match && !fieldErrors[match]) {
      fieldErrors[match] = ERROR_CODES.find((code) => code === issue.message) ?? 'required'
    }
  }
  return { success: false, fieldErrors }
}
