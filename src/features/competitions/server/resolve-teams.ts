import type { Payload, TypedUser } from 'payload'

/**
 * Team ids by short name, adding the teams we don't have yet (opponents new to the league). Runs
 * as the signed-in editor (`overrideAccess: false`).
 */
export async function resolveTeams(
  { payload, user }: { payload: Payload; user: TypedUser },
  shortNames: readonly string[],
): Promise<{ ids: Map<string, number>; added: number }> {
  const { docs } = await payload.find({
    collection: 'teams',
    where: { shortName: { in: shortNames } },
    depth: 0,
    pagination: false,
    select: { shortName: true },
    user,
    overrideAccess: false,
  })
  const ids = new Map(docs.map((team) => [team.shortName, team.id]))
  let added = 0
  for (const shortName of new Set(shortNames)) {
    if (ids.has(shortName)) continue
    // Imports only give the code; editors can add the full name in the admin later.
    const team = await payload.create({
      collection: 'teams',
      data: { name: shortName, shortName },
      user,
      overrideAccess: false,
    })
    ids.set(shortName, team.id)
    added++
  }
  return { ids, added }
}
