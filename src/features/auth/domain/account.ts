import { z } from 'zod'

import { readFormText } from '@/shared/lib/form-data'

export const ACCOUNT_NAME_MAX_LENGTH = 80
const INITIALS_LENGTH = 2

/** Who is signed in, as the account menu shows them. */
export type Account = {
  name: string | null
  email: string
}

/**
 * Up to two initials for the avatar: first and last name ("Saqib Rafiq" → "SR"), else the start
 * of the email ("saqib@…" → "SA").
 */
export function getInitials({ name, email }: Account): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  const [first, ...rest] = words
  const last = rest.at(-1)
  if (first) {
    return `${first.charAt(0)}${last?.charAt(0) ?? ''}`.toUpperCase()
  }
  return email.slice(0, INITIALS_LENGTH).toUpperCase()
}

export type AccountFormErrorCode = 'required' | 'tooLong' | 'email' | 'emailTaken'

const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(ACCOUNT_NAME_MAX_LENGTH, { error: 'tooLong' }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'email' })),
})

export type AccountInput = z.infer<typeof accountFormSchema>
export type AccountFieldErrors = Partial<Record<keyof AccountInput, AccountFormErrorCode>>

export type AccountFormParseResult =
  { success: true; account: AccountInput } | { success: false; fieldErrors: AccountFieldErrors }

/** Validates the edit profile form; errors are codes the form translates. */
export function parseAccountForm(formData: FormData): AccountFormParseResult {
  const parsed = accountFormSchema.safeParse({
    name: readFormText(formData, 'name'),
    email: readFormText(formData, 'email'),
  })
  if (parsed.success) {
    return { success: true, account: parsed.data }
  }

  const fieldErrors: AccountFieldErrors = {}
  for (const issue of parsed.error.issues) {
    const [field] = issue.path
    if ((field === 'name' || field === 'email') && !fieldErrors[field]) {
      fieldErrors[field] =
        issue.message === 'tooLong' ? 'tooLong' : field === 'email' ? 'email' : 'required'
    }
  }
  return { success: false, fieldErrors }
}

/** What to greet the editor by: their first name, else their email. */
export function getGreetingName({ name, email }: Account): string {
  const [firstName] = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return firstName ?? email
}
