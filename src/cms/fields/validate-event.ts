import type { Validate } from 'payload'

/** Kept short on purpose (data minimisation): enough for the captain to understand. */
export const REASON_MAX_LENGTH = 300

type EventSiblings = { fixture?: unknown; practice?: unknown }
type AnswerSiblings = { response?: unknown }

const isSet = (value: unknown) => value !== null && value !== undefined && value !== ''

/** An answer or record is for exactly one event: a fixture or a practice, never both or neither. */
export const validateOneEvent: Validate<unknown, unknown, EventSiblings> = (
  _value,
  { siblingData },
) =>
  isSet(siblingData.fixture) !== isSet(siblingData.practice) ||
  'Choose either a match or a practice.'

/** "Not going" always needs a reason (R-6); "Going" needs none. */
export const validateReason: Validate<string | null | undefined, unknown, AnswerSiblings> = (
  value,
  { siblingData },
) => {
  if (siblingData.response !== 'not-going') return true
  const reason = value?.trim() ?? ''
  if (reason === '') return 'Please give a reason for not going.'
  return (
    reason.length <= REASON_MAX_LENGTH || `Keep it under ${String(REASON_MAX_LENGTH)} characters.`
  )
}
