import type { CollectionConfig, Validate } from 'payload'

import { WICKETS_PER_INNINGS } from '../../domain/cricket'
import { anyone } from '../access/anyone'
import { validateOvers } from '../fields/validate-overs'
import { validateTime } from '../fields/validate-time'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'
import { setFixtureTitle } from '../hooks/set-fixture-title'

export const FIXTURE_STAGES = ['league', 'qualifier', 'semi-final', 'final'] as const
export const FIXTURE_STATUSES = ['scheduled', 'completed', 'abandoned', 'cancelled'] as const
export const RESULT_METHODS = ['normal', 'dls', 'forfeit', 'walkover', 'no-result'] as const
const AWARDED_METHODS = new Set(['forfeit', 'walkover'])

const MAX_INNINGS = 2

type FixtureFormData = {
  status?: string
  team1?: unknown
  team2?: unknown
  result?: { method?: string; winner?: unknown }
}

function relationId(value: unknown): unknown {
  return typeof value === 'object' && value !== null && 'id' in value ? value.id : value
}

function battingTeamOf(row: unknown): unknown {
  return typeof row === 'object' && row !== null && 'battingTeam' in row
    ? relationId(row.battingTeam)
    : undefined
}

const validateTeam2: Validate<unknown, FixtureFormData> = (value, { data }) =>
  !value || relationId(value) !== relationId(data.team1) || 'A team cannot play against itself.'

const validateInnings: Validate<unknown[], FixtureFormData> = (value, { data }) => {
  const rows = value ?? []
  const participants = [relationId(data.team1), relationId(data.team2)]

  if (rows.some((row) => !participants.includes(battingTeamOf(row)))) {
    return 'Each batting team must be one of the two teams in this fixture.'
  }

  if (
    data.status === 'completed' &&
    data.result?.method === 'normal' &&
    rows.length !== MAX_INNINGS
  ) {
    return 'A result decided on the field needs both innings.'
  }

  return true
}

const validateWinner: Validate<unknown, FixtureFormData> = (value, { data }) => {
  if (AWARDED_METHODS.has(data.result?.method ?? '') && !value) {
    return 'Select the team awarded the match.'
  }

  if (value && ![relationId(data.team1), relationId(data.team2)].includes(relationId(value))) {
    return 'The winner must be one of the two teams in this fixture.'
  }

  return true
}

const isCompleted = (data: FixtureFormData) => data.status === 'completed'

export const fixtures: CollectionConfig = {
  slug: 'fixtures',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'competition', 'status'],
    description:
      'Matches and results. List teams in batting order for completed matches — winner and margin are calculated from the innings.',
  },
  access: {
    read: anyone,
  },
  defaultSort: '-date',
  hooks: {
    beforeChange: [setFixtureTitle],
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar', description: 'Generated from date and teams.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'competition', type: 'relationship', relationTo: 'competitions', required: true },
        {
          name: 'stage',
          type: 'select',
          required: true,
          defaultValue: 'league',
          options: [...FIXTURE_STAGES],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          index: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' } },
        },
        {
          name: 'startTime',
          type: 'text',
          validate: validateTime,
          admin: { description: 'Local time, HH:mm (optional).' },
        },
      ],
    },
    { name: 'venue', type: 'text', admin: { description: 'Ground name (optional).' } },
    {
      type: 'row',
      fields: [
        { name: 'team1', type: 'relationship', relationTo: 'teams', required: true },
        {
          name: 'team2',
          type: 'relationship',
          relationTo: 'teams',
          required: true,
          validate: validateTeam2,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      index: true,
      options: [...FIXTURE_STATUSES],
    },
    {
      name: 'innings',
      type: 'array',
      maxRows: MAX_INNINGS,
      validate: validateInnings,
      admin: {
        condition: isCompleted,
        description: 'In batting order.',
      },
      fields: [
        { name: 'battingTeam', type: 'relationship', relationTo: 'teams', required: true },
        {
          type: 'row',
          fields: [
            { name: 'runs', type: 'number', required: true, min: 0 },
            { name: 'wickets', type: 'number', required: true, min: 0, max: WICKETS_PER_INNINGS },
            { name: 'overs', type: 'text', required: true, validate: validateOvers },
            {
              name: 'maxOvers',
              type: 'number',
              required: true,
              min: 0,
              admin: { description: 'Allotted overs (reduced if shortened).' },
            },
          ],
        },
      ],
    },
    {
      name: 'result',
      type: 'group',
      admin: { condition: isCompleted },
      fields: [
        {
          name: 'method',
          type: 'select',
          required: true,
          defaultValue: 'normal',
          options: [
            { label: 'Decided on the field', value: 'normal' },
            { label: 'Duckworth–Lewis–Stern (DLS)', value: 'dls' },
            { label: 'Forfeit (a team conceded)', value: 'forfeit' },
            { label: 'Walkover (opponent did not turn up)', value: 'walkover' },
            { label: 'No result', value: 'no-result' },
          ],
        },
        {
          name: 'winner',
          type: 'relationship',
          relationTo: 'teams',
          validate: validateWinner,
          admin: {
            condition: (_, siblingData: { method?: string }) =>
              siblingData.method === 'dls' || AWARDED_METHODS.has(siblingData.method ?? ''),
            description: 'For DLS: leave empty if the match was tied.',
          },
        },
        {
          type: 'row',
          admin: {
            condition: (_, siblingData: { method?: string; winner?: unknown }) =>
              siblingData.method === 'dls' && Boolean(siblingData.winner),
          },
          fields: [
            { name: 'marginValue', type: 'number', min: 1, label: 'Margin' },
            {
              name: 'marginUnit',
              type: 'select',
              label: 'Margin unit',
              options: ['runs', 'wickets'],
            },
          ],
        },
      ],
    },
    {
      name: 'importKey',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set by data imports to avoid duplicates.',
      },
    },
  ],
}
