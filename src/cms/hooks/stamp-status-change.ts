import type { CollectionBeforeChangeHook } from 'payload'

type StoredSquad = { status?: unknown; statusChangedAt?: unknown }

/**
 * Stamps when a squad's status last changed: on creation and whenever the status moves (submitted,
 * returned, approved, reopened). The stamp versions each of those steps, so the members' app sends
 * each notice once per step, also when a squad is submitted a second time after a return (ADR-0004
 * in the app). It is always the server's time: a value in the request is ignored.
 */
export const stampStatusChange: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  const stored = (originalDoc ?? {}) as StoredSquad
  const isStatusChange =
    operation === 'create' || (data.status !== undefined && data.status !== stored.status)
  return {
    ...data,
    statusChangedAt: isStatusChange ? new Date().toISOString() : (stored.statusChangedAt ?? null),
  }
}
