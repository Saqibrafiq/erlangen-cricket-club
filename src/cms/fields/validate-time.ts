import type { Validate } from 'payload'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/** 24-hour "HH:mm"; empty passes (combine with `required` where a time is mandatory). */
export const validateTime: Validate<string | null | undefined> = (value) =>
  !value || TIME_PATTERN.test(value) || 'Use 24-hour format HH:mm, e.g. 13:30.'
