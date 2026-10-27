import { z } from 'zod'

export const COMPETITION_NAME_MAX_LENGTH = 100
/** Seasons are years; matches the sponsors' range. */
export const FIRST_SEASON = 2000
export const LAST_SEASON = 2100
/** The formats our teams play: T20 and 50 overs. */
export const MAX_OVERS_OPTIONS = [20, 50] as const
export const NEW_COMPETITION = 'new'

export type NewCompetitionErrorCode = 'required' | 'tooLong' | 'season' | 'maxOvers'

const newCompetitionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(COMPETITION_NAME_MAX_LENGTH, { error: 'tooLong' }),
  season: z.coerce
    .number({ error: 'season' })
    .int({ error: 'season' })
    .min(FIRST_SEASON, { error: 'season' })
    .max(LAST_SEASON, { error: 'season' })
    .transform(String),
  maxOvers: z.coerce
    .number({ error: 'maxOvers' })
    .refine((overs) => MAX_OVERS_OPTIONS.some((option) => option === overs), {
      error: 'maxOvers',
    }),
})

export type NewCompetition = z.infer<typeof newCompetitionSchema>
export type NewCompetitionField = keyof NewCompetition
export type NewCompetitionFieldErrors = Partial<
  Record<NewCompetitionField, NewCompetitionErrorCode>
>

/** The import's target: an existing competition, or one to create (e.g. a new season). */
export type StandingsImportTarget =
  { kind: 'existing'; id: number } | { kind: 'new'; competition: NewCompetition }

export type StandingsImportFormResult =
  | { success: true; target: StandingsImportTarget; csv: string }
  | { success: false; fieldErrors: NewCompetitionFieldErrors }

const FIELDS: readonly NewCompetitionField[] = ['name', 'season', 'maxOvers']
const ERROR_CODES: readonly NewCompetitionErrorCode[] = [
  'required',
  'tooLong',
  'season',
  'maxOvers',
]

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

/** Validates the import form's target; the CSV itself is checked by `parseStandingsCsv`. */
export function parseStandingsImportForm(formData: FormData): StandingsImportFormResult {
  const csv = readText(formData, 'csv')
  const competition = readText(formData, 'competition')
  if (competition !== NEW_COMPETITION) {
    const id = Number(competition)
    return Number.isInteger(id) && id > 0
      ? { success: true, target: { kind: 'existing', id }, csv }
      : { success: false, fieldErrors: { name: 'required' } }
  }

  const parsed = newCompetitionSchema.safeParse({
    name: readText(formData, 'name'),
    season: readText(formData, 'season') || undefined,
    maxOvers: readText(formData, 'maxOvers') || undefined,
  })
  if (parsed.success) {
    return { success: true, target: { kind: 'new', competition: parsed.data }, csv }
  }

  const fieldErrors: NewCompetitionFieldErrors = {}
  for (const issue of parsed.error.issues) {
    const [field] = issue.path
    const code = ERROR_CODES.find((errorCode) => errorCode === issue.message) ?? 'required'
    const match = FIELDS.find((name) => name === field)
    if (match && !fieldErrors[match]) {
      fieldErrors[match] = code
    }
  }
  return { success: false, fieldErrors }
}
