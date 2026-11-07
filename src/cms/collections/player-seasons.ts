import type { Access, CollectionConfig, Field, Validate } from 'payload'

import { isValidOvers } from '../../domain/cricket/overs'
import { revalidatePagesAfterChange, revalidatePagesAfterDelete } from '../hooks/revalidate-pages'

/** Where the season was played: for the club's teams, or for a district team (not in club totals). */
export const SEASON_COMPETITIONS = ['club', 'district'] as const

/** Which matches a record counts: all of them, or only the T20 or the 50-over leagues. */
export const SEASON_FORMATS = ['all', 't20', 'fifty-over', 'league'] as const

const FIRST_SEASON = 2010
const LAST_SEASON = 2100

/** Visitors see a season only when its player agreed to appear on the website; editors see all. */
const playerConsentedOrSignedIn: Access = ({ req }) =>
  req.user ? true : { 'player.hasPublishConsent': { equals: true } }

const validateOvers: Validate<string | null | undefined> = (value) =>
  !value ||
  isValidOvers(value) ||
  'Use cricket notation, e.g. "110.1" (the digit after the dot counts balls, 0–5).'

const count = (name: string, label: string): Field => ({
  name,
  label,
  type: 'number',
  min: 0,
  admin: { width: '25%', step: 1 },
})

/**
 * A player's season record for one competition, as published by the league (CricClubs). The
 * stored counts are the source; averages, strike rates and economy are calculated from them
 * (domain/cricket), never stored. See ADR-0022.
 */
export const playerSeasons: CollectionConfig = {
  slug: 'player-seasons',
  labels: { singular: 'Player season', plural: 'Player seasons' },
  admin: {
    useAsTitle: 'season',
    group: 'Club',
    defaultColumns: ['player', 'season', 'competition', 'format', 'team'],
    description:
      'Season records per player (from the league’s season stats). Career totals on the profile add these up.',
  },
  access: {
    read: playerConsentedOrSignedIn,
  },
  hooks: {
    afterChange: [revalidatePagesAfterChange],
    afterDelete: [revalidatePagesAfterDelete],
  },
  // One record per player, season, competition, format and team (none for whole-season records).
  indexes: [{ fields: ['player', 'season', 'competition', 'format', 'team'], unique: true }],
  defaultSort: '-season',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'player',
          type: 'relationship',
          relationTo: 'players',
          required: true,
          index: true,
          admin: { width: '35%' },
        },
        {
          name: 'season',
          type: 'number',
          required: true,
          min: FIRST_SEASON,
          max: LAST_SEASON,
          admin: { width: '25%', step: 1 },
        },
        {
          name: 'competition',
          type: 'select',
          required: true,
          defaultValue: 'club',
          options: [
            { label: 'Club (all ECC teams)', value: 'club' },
            { label: 'District team (not in club totals)', value: 'district' },
          ],
          admin: { width: '25%' },
        },
        {
          name: 'format',
          type: 'select',
          required: true,
          defaultValue: 'all',
          options: [
            { label: 'All matches (incl. friendlies)', value: 'all' },
            { label: 'T20 leagues', value: 't20' },
            { label: '50-over leagues', value: 'fifty-over' },
            { label: 'League matches for one team (T20 + 50-over)', value: 'league' },
          ],
          admin: {
            width: '15%',
            description:
              'Career totals add up "All matches"; T20, 50-over and the per-team records are its parts.',
          },
        },
      ],
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      filterOptions: { isClubTeam: { equals: true } },
      admin: {
        description:
          'Only for a record of one team (format "League matches for one team"); leave empty for the whole season.',
      },
    },
    {
      name: 'batting',
      type: 'group',
      admin: { description: 'Leave empty if the player did not bat that season.' },
      fields: [
        {
          type: 'row',
          fields: [
            count('matches', 'Matches'),
            count('innings', 'Innings'),
            count('notOuts', 'Not outs'),
            count('runs', 'Runs'),
          ],
        },
        {
          type: 'row',
          fields: [
            count('balls', 'Balls faced'),
            count('highestScore', 'Highest score'),
            {
              name: 'isHighestScoreNotOut',
              label: 'Highest score not out',
              type: 'checkbox',
              defaultValue: false,
              admin: { width: '25%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            count('hundreds', '100s'),
            count('fifties', '50s'),
            count('fours', '4s'),
            count('sixes', '6s'),
          ],
        },
      ],
    },
    {
      name: 'bowling',
      type: 'group',
      admin: { description: 'Leave empty if the player did not bowl that season.' },
      fields: [
        {
          type: 'row',
          fields: [
            count('matches', 'Matches'),
            count('innings', 'Innings'),
            {
              name: 'overs',
              type: 'text',
              validate: validateOvers,
              admin: { width: '25%', placeholder: '110.1' },
            },
            count('maidens', 'Maidens'),
          ],
        },
        {
          type: 'row',
          fields: [
            count('runsConceded', 'Runs conceded'),
            count('wickets', 'Wickets'),
            count('bestWickets', 'Best: wickets'),
            count('bestRuns', 'Best: runs'),
          ],
        },
        {
          type: 'row',
          fields: [
            count('dotBalls', 'Dot balls'),
            count('fourWicketHauls', '4-wicket hauls'),
            count('fiveWicketHauls', '5-wicket hauls'),
            count('hatTricks', 'Hat-tricks'),
          ],
        },
        {
          type: 'row',
          fields: [count('wides', 'Wides'), count('noBalls', 'No balls')],
        },
      ],
    },
  ],
}
