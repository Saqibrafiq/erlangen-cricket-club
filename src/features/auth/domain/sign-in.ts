import { z } from 'zod'

/** Payload's admin, where signed-in editors manage the site. */
export const ADMIN_PATH = '/admin'

// RFC 5321 caps an address at 254 characters; the password cap only stops absurd payloads.
export const EMAIL_MAX_LENGTH = 254
export const PASSWORD_MAX_LENGTH = 256

export type SignInErrorCode = 'required' | 'invalidEmail' | 'tooLong'

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(EMAIL_MAX_LENGTH, { error: 'tooLong' })
    .pipe(z.email({ error: 'invalidEmail' })),
  // Not trimmed: spaces can be part of a password.
  password: z.string().min(1, { error: 'required' }).max(PASSWORD_MAX_LENGTH, { error: 'tooLong' }),
})

export type SignInCredentials = z.infer<typeof signInSchema>
export type SignInField = keyof SignInCredentials

export type SignInParseResult =
  | { success: true; credentials: SignInCredentials }
  | {
      success: false
      fieldErrors: Partial<Record<SignInField, SignInErrorCode>>
      /** Shown again after an error; the password never is. */
      email: string
    }

const SIGN_IN_FIELDS: readonly SignInField[] = ['email', 'password']
const ERROR_CODES: readonly SignInErrorCode[] = ['required', 'invalidEmail', 'tooLong']

function isSignInField(key: PropertyKey | undefined): key is SignInField {
  return typeof key === 'string' && SIGN_IN_FIELDS.some((field) => field === key)
}

function toErrorCode(message: string): SignInErrorCode {
  return ERROR_CODES.find((code) => code === message) ?? 'required'
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

/** Validates a submitted sign-in form; errors are codes the form translates. */
export function parseSignIn(formData: FormData): SignInParseResult {
  const email = readField(formData, 'email')
  const parsed = signInSchema.safeParse({ email, password: readField(formData, 'password') })

  if (parsed.success) {
    return { success: true, credentials: parsed.data }
  }

  const fieldErrors: Partial<Record<SignInField, SignInErrorCode>> = {}
  for (const issue of parsed.error.issues) {
    const [field] = issue.path
    if (isSignInField(field) && !fieldErrors[field]) {
      fieldErrors[field] = toErrorCode(issue.message)
    }
  }

  return { success: false, fieldErrors, email: email.trim() }
}

/**
 * Where to go after signing in. Only pages of the admin are allowed, so a crafted
 * `?redirect=https://evil.example` link cannot turn the login into an open redirect.
 */
export function getSafeRedirectPath(target: unknown): string {
  if (typeof target !== 'string') {
    return ADMIN_PATH
  }

  const isAdminPath = target === ADMIN_PATH || target.startsWith(`${ADMIN_PATH}/`)
  // Backslashes and protocol-relative tricks ("/admin/..//evil") have no place in an admin path.
  const isPlainPath = !target.includes('\\') && !target.includes('//')

  return isAdminPath && isPlainPath ? target : ADMIN_PATH
}
