import { describe, expect, it } from 'vitest'

import { parseServerEnv } from './env'

const VALID_ENV = {
  DATABASE_URI: 'postgres://postgres:postgres@localhost:5432/ecc',
  PAYLOAD_SECRET: 'a'.repeat(32),
}

describe('parseServerEnv', () => {
  it('returns the parsed variables when all required values are valid', () => {
    expect(parseServerEnv(VALID_ENV)).toEqual({ ...VALID_ENV, BLOB_READ_WRITE_TOKEN: undefined })
  })

  it('treats an empty optional token as not set', () => {
    expect(parseServerEnv({ ...VALID_ENV, BLOB_READ_WRITE_TOKEN: '' }).BLOB_READ_WRITE_TOKEN).toBe(
      undefined,
    )
  })

  it('throws a readable error when the payload secret is too short', () => {
    expect(() => parseServerEnv({ ...VALID_ENV, PAYLOAD_SECRET: 'short' })).toThrow(
      /PAYLOAD_SECRET/,
    )
  })

  it('throws when the database URI is missing', () => {
    expect(() => parseServerEnv({ PAYLOAD_SECRET: VALID_ENV.PAYLOAD_SECRET })).toThrow(
      /DATABASE_URI/,
    )
  })
})
