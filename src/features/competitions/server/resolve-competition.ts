import type { Payload, TypedUser } from 'payload'

import type { CompetitionTarget } from '../domain/competition-target'

/**
 * The id of an import's competition, creating it first for a new season. Runs as the signed-in
 * editor (`overrideAccess: false`); the slug is generated from name and season.
 */
export async function resolveCompetition(
  { payload, user }: { payload: Payload; user: TypedUser },
  target: CompetitionTarget,
): Promise<number> {
  if (target.kind === 'existing') {
    return target.id
  }
  const competition = await payload.create({
    collection: 'competitions',
    data: { ...target.competition, slug: '' },
    user,
    overrideAccess: false,
  })
  return competition.id
}
