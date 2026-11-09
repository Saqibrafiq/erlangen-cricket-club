import type { CollectionConfig } from 'payload'

import {
  adminsOrOwnTeam,
  adminsOwnTeamOrOwnPlayer,
  createForOwnPlayer,
} from '../access/members-app'
import { adminField, admins } from '../access/roles'
import { applyCorrection, recordDecision } from '../hooks/apply-correction'
import { setEventTeam } from '../hooks/set-event-team'

/** The longest note a player can add to a correction request. */
export const CORRECTION_NOTE_MAX_LENGTH = 300

/**
 * A player's request to be marked present at a practice the captain recorded them absent for
 * (UC-18). The captain of the practice's team or an admin accepts or declines it; accepting marks
 * the player present. One request per player and practice.
 */
export const attendanceCorrections: CollectionConfig = {
  slug: 'attendance-corrections',
  labels: { singular: 'Attendance correction', plural: 'Attendance corrections' },
  admin: {
    group: 'Members’ app',
    defaultColumns: ['player', 'practice', 'status', 'updatedAt'],
  },
  access: {
    read: adminsOwnTeamOrOwnPlayer,
    create: createForOwnPlayer,
    update: adminsOrOwnTeam,
    delete: admins,
  },
  hooks: {
    beforeChange: [setEventTeam, recordDecision],
    afterChange: [applyCorrection],
  },
  indexes: [{ fields: ['practice', 'player'], unique: true }],
  fields: [
    {
      name: 'practice',
      type: 'relationship',
      relationTo: 'practice-sessions',
      required: true,
      access: { update: adminField },
    },
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      required: true,
      access: { update: adminField },
    },
    {
      name: 'note',
      type: 'text',
      maxLength: CORRECTION_NOTE_MAX_LENGTH,
      access: { update: adminField },
      admin: { description: 'What the player wrote, e.g. "Came late, after the check-in".' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'requested',
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
      ],
      // A player only asks; the decision is the captain's or the Board's (collection update).
      access: { create: adminField },
    },
    {
      name: 'decidedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}
