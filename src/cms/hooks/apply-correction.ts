import type { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'

import type { AttendanceCorrection } from '../../payload-types'

import { relationId } from '../access/roles'

/** Who decided a request is kept with it, so the player can see it was looked at (UC-18). */
export const recordDecision: CollectionBeforeChangeHook<AttendanceCorrection> = ({
  data,
  originalDoc,
  req,
}) => {
  const isDecision =
    originalDoc !== undefined && data.status !== undefined && data.status !== originalDoc.status
  return isDecision && req.user ? { ...data, decidedBy: req.user.id } : data
}

/**
 * Accepting a request marks the player present at the practice: the existing attendance record is
 * flipped, or one is created. Runs in the same transaction as the decision, as the system, since
 * the decider's right to change attendance was checked by the request's own access rules.
 */
export const applyCorrection: CollectionAfterChangeHook<AttendanceCorrection> = async ({
  doc,
  previousDoc,
  req,
}) => {
  // previousDoc is empty ({}) on create, so a status there means this was already decided.
  if (doc.status !== 'accepted' || previousDoc.status === 'accepted') return doc

  const practice = relationId(doc.practice)
  const player = relationId(doc.player)
  if (practice === null || player === null) return doc

  const { docs } = await req.payload.find({
    collection: 'attendance',
    where: { practice: { equals: practice }, player: { equals: player } },
    limit: 1,
    depth: 0,
    req,
  })
  const [record] = docs
  if (record) {
    await req.payload.update({
      collection: 'attendance',
      id: record.id,
      data: { attended: true },
      req,
    })
  } else {
    await req.payload.create({
      collection: 'attendance',
      // The team is required but derived from the practice by the attendance hook (setEventTeam).
      data: { practice, player, attended: true, isWalkIn: false } as never,
      req,
    })
  }
  return doc
}
