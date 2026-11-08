import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { isAdmin, relationId } from '../access/roles'

type SquadStatus = 'open' | 'submitted' | 'approved' | 'returned'
type StoredSquad = { status?: SquadStatus; picks?: unknown }

const FORBIDDEN = 403

/** A captain may hand in a squad that is open or was returned, or hand it in again. */
const CAPTAIN_SUBMITTABLE: readonly SquadStatus[] = ['open', 'returned', 'submitted']

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
 * a squad is announced the selection is the Board's: the captain may still record no-shows.
 * Field access alone cannot express this, since it depends on the old and the new status.
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
      CAPTAIN_SUBMITTABLE.includes(stored.status)
    if (!isSubmitting) {
      throw new APIError('Only the Board can approve, return or reopen a squad.', FORBIDDEN)
    }
  }

  const isPicksChange =
    data.picks !== undefined && describePicks(data.picks) !== describePicks(stored.picks)
  if (stored.status === 'approved' && isPicksChange) {
    throw new APIError('The squad is announced: only the Board can change it now.', FORBIDDEN)
  }
  return data
}
