import type { CollectionBeforeChangeHook } from 'payload'

type TeamReference = number | string | { shortName?: string | null } | null | undefined

async function getShortName(
  team: TeamReference,
  findTeam: (id: number | string) => Promise<{ shortName?: string | null }>,
): Promise<string> {
  if (team === null || team === undefined) {
    return '?'
  }

  if (typeof team === 'object') {
    return team.shortName ?? '?'
  }

  return (await findTeam(team)).shortName ?? '?'
}

/** Builds a readable admin title such as "2026-09-06 · NCC-I v ECC-I". */
export const setFixtureTitle: CollectionBeforeChangeHook = async ({ data, req }) => {
  const findTeam = (id: number | string) =>
    req.payload.findByID({ collection: 'teams', id, depth: 0, req })

  const [team1, team2] = await Promise.all([
    getShortName(data.team1 as TeamReference, findTeam),
    getShortName(data.team2 as TeamReference, findTeam),
  ])
  const date = typeof data.date === 'string' ? data.date.slice(0, 10) : ''

  return { ...data, title: `${date} · ${team1} v ${team2}` }
}
