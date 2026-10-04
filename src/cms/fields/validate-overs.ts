import type { Validate } from 'payload'

import { isValidOvers } from '../../domain/cricket'

export const validateOvers: Validate<string | null | undefined> = (value) =>
  (typeof value === 'string' && isValidOvers(value)) || 'Use cricket notation, e.g. "20" or "19.2".'
