import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { isAdmin, relationId } from '../access/roles'

type SquadStatus = 'open' | 'submitted' | 'approved' | 'returned'
type StoredSquad = { status?: SquadStatus; picks?: unknown }

const FORBIDDEN = 403

/** A captain hands in a squad that is open or was returned; once submitted it is the Board's. */
const CAPTAIN_EDITABLE: readonly SquadStatus[] = ['open', 'returned']

function describePicks(picks: unknown): string {
  if (!Array.isArray(picks)) return ''
  return picks
    .map((pick: { player?: unknown; role?: unknown; isBorrowed?: unknown }) =>
      [relationId(pick.player), pick.role, Boolean(pick.isBorrowed)].join(':'),
    )
    .join(',')
}

/**
 * The Board approves, returns and reopens squads; a captain only submits theirs (ADR-0024). Once
 * submitted, the selection is the Board's until they reopen it; the captain may still record
 * no-shows. Field access alone cannot express this, since it depends on the old and new status.
 */
export const guardSquadChanges: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  if (isAdmin(req.user)) return data
  const stored = (originalDoc ?? {}) as StoredSquad
  const status = data.status as SquadStatus | undefined

  // Only admins create squads, so a captain always changes a stored one.
  if (status !== undefined && status !== stored.status) {
    const isSubmitting =
      status === 'submitted' &&
      stored.status !== undefined &&
      CAPTAIN_EDITABLE.includes(stored.status)
    if (!isSubmitting) {
      throw new APIError('Only the Board can approve, return or reopen a squad.', FORBIDDEN)
    }
  }

  const isPicksChange =
    data.picks !== undefined && describePicks(data.picks) !== describePicks(stored.picks)
  const isHandedIn = stored.status !== undefined && !CAPTAIN_EDITABLE.includes(stored.status)
  if (isHandedIn && isPicksChange) {
    throw new APIError('The squad is submitted: only the Board can reopen it.', FORBIDDEN)
  }
  return data
}
