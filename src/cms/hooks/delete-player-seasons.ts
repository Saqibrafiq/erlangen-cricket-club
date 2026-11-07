import type { CollectionBeforeDeleteHook } from 'payload'

/**
 * A player's season records belong to them: deleting the player deletes the records first (in the
 * same request and transaction), as a record without its player cannot be shown or kept.
 */
export const deletePlayerSeasons: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: 'player-seasons',
    where: { player: { equals: id } },
    req,
  })
}
