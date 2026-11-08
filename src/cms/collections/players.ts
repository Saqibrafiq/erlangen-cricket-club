import type { CollectionConfig, FieldHook, Validate } from 'payload'

import type { Player } from '../../payload-types'
import { slugify } from '../../shared/lib/slugify'
import { consentedOrSignedIn } from '../access/consented-or-signed-in'
import { adminField, admins } from '../access/roles'
import { deletePlayerSeasons } from '../hooks/delete-player-seasons'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'

// A short introduction for the profile, not a biography.
const BIO_MAX_LENGTH = 400

/** Generates the URL slug from the name when an editor leaves it empty. */
const generateSlug: FieldHook<Player, string | null | undefined> = ({ value, data }) =>
  slugify(value ?? data?.name ?? '')

// Consent must be traceable (GDPR Art. 7(1)): ticking the box alone is not enough.
const validateConsentNote: Validate<string | null | undefined, Player> = (value, { data }) =>
  !data.hasPublishConsent ||
  Boolean(value?.trim()) ||
  'Note how and when the player agreed, e.g. "Signed membership form, 3 March 2026".'

/** Club players shown on the website, only with their consent. */
export const players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'name',
    group: 'Club',
    defaultColumns: ['name', 'playingRole', 'clubOffice', 'hasPublishConsent'],
    description:
      'Only players whose consent is recorded appear on the website. Stats come from their season records (Player seasons).',
  },
  access: {
    read: consentedOrSignedIn,
    // Website content: only the Board edits it (ADR-0024).
    create: admins,
    update: admins,
    delete: admins,
  },
  hooks: {
    beforeDelete: [deletePlayerSeasons],
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  defaultSort: 'name',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Head-and-shoulders photo, best cut out (transparent PNG or WebP) so the player stands on the club green. Initials are shown without one.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'playingRole',
          type: 'select',
          options: [
            { label: 'Batter', value: 'batter' },
            { label: 'Bowler', value: 'bowler' },
            { label: 'All-rounder', value: 'all-rounder' },
            { label: 'Wicketkeeper', value: 'wicketkeeper' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'battingStyle',
          type: 'select',
          options: [
            { label: 'Right-hand bat', value: 'right-hand' },
            { label: 'Left-hand bat', value: 'left-hand' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'bowlingStyle',
          type: 'select',
          options: [
            { label: 'Right-arm fast', value: 'right-arm-fast' },
            { label: 'Right-arm medium', value: 'right-arm-medium' },
            { label: 'Right-arm off-spin', value: 'right-arm-off-spin' },
            { label: 'Right-arm leg-spin', value: 'right-arm-leg-spin' },
            { label: 'Left-arm fast', value: 'left-arm-fast' },
            { label: 'Left-arm medium', value: 'left-arm-medium' },
            { label: 'Left-arm orthodox', value: 'left-arm-orthodox' },
            { label: 'Left-arm wrist-spin', value: 'left-arm-wrist-spin' },
          ],
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'teams',
      type: 'relationship',
      relationTo: 'teams',
      hasMany: true,
      filterOptions: { isClubTeam: { equals: true } },
      admin: { description: 'Club teams the player plays for.' },
    },
    {
      type: 'collapsible',
      label: 'Members’ app',
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'squadTeam',
              label: 'Team squad',
              type: 'relationship',
              relationTo: 'teams',
              filterOptions: { isClubTeam: { equals: true } },
              access: { create: adminField, update: adminField },
              admin: {
                width: '50%',
                description: 'The one squad this player belongs to in the app (ECC I or ECC II).',
              },
            },
            {
              name: 'isEcc1Eligible',
              label: 'May play for ECC I',
              type: 'checkbox',
              defaultValue: false,
              access: { create: adminField, update: adminField },
              admin: {
                width: '50%',
                description:
                  'Motion 2024/06: new members without a long-term commitment may not play in an upper league.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'clubOffice',
      type: 'select',
      options: [
        { label: 'President', value: 'president' },
        { label: 'Vice President', value: 'vice-president' },
        { label: 'Treasurer', value: 'treasurer' },
        { label: 'Secretary', value: 'secretary' },
      ],
      admin: { description: 'Board role, if the player holds one.' },
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      maxLength: BIO_MAX_LENGTH,
      admin: { description: 'Two or three sentences in the player’s own words.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: {
        position: 'sidebar',
        description: 'URL segment, generated from the name if left empty.',
      },
    },
    {
      name: 'isFeaturedOnHome',
      label: 'Show in the home page line-up',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Up to seven players stand in the squad line-up on the home page. Best with a cut-out photo.',
      },
    },
    {
      name: 'hasPublishConsent',
      label: 'Agreed to appear on the website',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Name, photo and stats are public only when ticked. On a removal request, untick and delete the photo in Media.',
      },
    },
    {
      name: 'consentNote',
      label: 'How consent was given',
      type: 'text',
      validate: validateConsentNote,
      // Internal record: never part of the public API.
      access: { read: adminField, update: adminField },
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data.hasPublishConsent),
      },
    },
    {
      name: 'instagramGraphics',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '/cms/components/instagram-graphics#InstagramGraphics' },
      },
    },
  ],
}
