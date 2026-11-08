import { APIError, type CollectionBeforeChangeHook, type PayloadRequest } from 'payload'

import { relationId } from '../access/roles'

type TeamLike = { id?: unknown; isClubTeam?: boolean | null }

const BAD_REQUEST = 400
const FORBIDDEN = 403

/** The club's own team among a fixture's two teams (populated), or `null` if neither is ours. */
export function pickClubTeamId(teams: readonly unknown[]): number | string | null {
  const club = teams.find(
    (team): team is TeamLike =>
      typeof team === 'object' && team !== null && (team as TeamLike).isClubTeam === true,
  )
  return club ? relationId(club) : null
}

async function getFixtureTeam(req: PayloadRequest, id: number | string) {
  const fixture = await req.payload.findByID({ collection: 'fixtures', id, depth: 1, req })
  return pickClubTeamId([fixture.team1, fixture.team2])
}

async function getPracticeTeam(req: PayloadRequest, id: number | string) {
  const practice = await req.payload.findByID({
    collection: 'practice-sessions',
    id,
    depth: 0,
    req,
  })
  return relationId(practice.team)
}

/**
 * The ECC team an answer, attendance record or squad belongs to, derived from its fixture or
 * practice, never taken from the request. A request that names another team is refused, so a
 * captain cannot record for a team they do not lead (ADR-0024).
 */
export const setEventTeam: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const stored = originalDoc as { fixture?: unknown; practice?: unknown } | undefined
  const fixtureId = relationId(data.fixture ?? stored?.fixture)
  const practiceId = relationId(data.practice ?? stored?.practice)
  let team: number | string | null = null
  if (fixtureId !== null) team = await getFixtureTeam(req, fixtureId)
  else if (practiceId !== null) team = await getPracticeTeam(req, practiceId)

  if (team === null) {
    throw new APIError('The fixture or practice does not belong to an ECC team.', BAD_REQUEST)
  }
  const requested = relationId(data.team)
  if (requested !== null && requested !== team) {
    throw new APIError('The team does not match the fixture or practice.', FORBIDDEN)
  }
  return { ...data, team }
}
