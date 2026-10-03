import { z } from 'zod'

const MIN_PAYLOAD_SECRET_LENGTH = 32

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value === '' ? undefined : value))

const serverEnvSchema = z.object({
  DATABASE_URI: z.url(),
  PAYLOAD_SECRET: z.string().min(MIN_PAYLOAD_SECRET_LENGTH),
  BLOB_READ_WRITE_TOKEN: optionalString,
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

/**
 * Validates server-side environment variables. Throws on invalid input so a
 * misconfigured deployment fails at startup instead of at the first request.
 */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source)

  if (!result.success) {
    throw new Error(`Invalid server environment variables:\n${z.prettifyError(result.error)}`)
  }

  return result.data
}
