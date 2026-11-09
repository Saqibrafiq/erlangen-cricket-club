import type { GlobalConfig } from 'payload'

import { admins, members } from '../access/roles'

/** Club-wide settings of the members' app, set by the Board (ADR-0024). */
export const membersAppSettings: GlobalConfig = {
  slug: 'members-app-settings',
  label: 'Members’ app settings',
  admin: { group: 'Members’ app' },
  access: { read: members, update: admins },
  fields: [
    {
      name: 'targetsStartOn',
      label: 'Count availability targets from',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description:
          'Matches before this day do not count for the availability targets (motions 2023/05 and 2023/06), e.g. the day the app went live. Empty: the whole season counts.',
      },
    },
  ],
}
