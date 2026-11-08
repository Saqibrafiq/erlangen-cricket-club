import type { CollectionBeforeChangeHook, CollectionConfig, Validate } from 'payload'

import { adminField, admins, adminsOrSelf, isAdmin, ROLES } from '../access/roles'

const ROLE_LABELS = { player: 'Player', captain: 'Captain', admin: 'Admin (Board)' } as const

/**
 * The very first account is the club's admin: without this, "Create first user" would create a
 * player who could never manage the club (new accounts are players by default).
 */
const firstAccountIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  const { totalDocs } = await req.payload.count({ collection: 'users', req })
  return totalDocs === 0 ? { ...data, role: 'admin' } : data
}

/** A captain leads one team (motion 2024/05: one captain per league), so the team is required. */
const validateCaptainOf: Validate<unknown, unknown, { role?: string }> = (value, { siblingData }) =>
  siblingData.role !== 'captain' || Boolean(value) || 'A captain needs a team.'

export const users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role', 'captainOf'],
    description:
      'Accounts for the website and the members’ app. Every member is a player; captains lead a team; admins (the Board) manage both.',
  },
  auth: {
    // The session cookie only travels over HTTPS in production (localhost counts as secure too).
    cookies: { secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' },
    // The members' app runs its scheduled jobs as a service account with an API key (ADR-0024).
    useAPIKey: true,
  },
  access: {
    // The Payload admin panel is the Board's tool.
    admin: ({ req }) => isAdmin(req.user),
    read: adminsOrSelf,
    create: admins,
    update: adminsOrSelf,
    delete: admins,
  },
  hooks: {
    beforeChange: [firstAccountIsAdmin],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: { description: 'Shown in the account menu, e.g. "Saqib Rafiq".' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'player',
      options: ROLES.map((role) => ({ label: ROLE_LABELS[role], value: role })),
      // Read by the access rules on every request, so it travels in the session token.
      saveToJWT: true,
      access: { create: adminField, update: adminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'player',
      type: 'relationship',
      relationTo: 'players',
      unique: true,
      saveToJWT: true,
      access: { create: adminField, update: adminField },
      admin: {
        position: 'sidebar',
        description: 'The player this account belongs to: their answers and attendance are theirs.',
      },
    },
    {
      name: 'captainOf',
      label: 'Captain of',
      type: 'relationship',
      relationTo: 'teams',
      filterOptions: { isClubTeam: { equals: true } },
      saveToJWT: true,
      validate: validateCaptainOf,
      access: { create: adminField, update: adminField },
      admin: {
        position: 'sidebar',
        condition: (data) => data.role === 'captain',
      },
    },
  ],
}
