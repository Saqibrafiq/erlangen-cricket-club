import type { Player, PlayerSeasonRecord } from './types'

/** Test and Storybook data: the first is from the club's squad, the others are fictional. */
export const PLAYER: Player = {
  id: 1,
  slug: 'sagar-suri',
  name: 'Sagar Suri',
  photo: {
    url: '/api/media/file/player-sagar-suri.jpg',
    alt: 'Sagar Suri in the club kit',
    width: 640,
    height: 640,
  },
  playingRole: null,
  battingStyle: null,
  bowlingStyle: null,
  teams: [],
  clubOffice: null,
  bio: null,
  isFeaturedOnHome: false,
}

export const PLAYER_WITH_DETAILS: Player = {
  ...PLAYER,
  id: 2,
  slug: 'jonas-becker',
  name: 'Jonas Becker',
  photo: null,
  playingRole: 'all-rounder',
  battingStyle: 'right-hand',
  bowlingStyle: 'right-arm-medium',
  teams: [
    { id: 1, name: 'Erlangen Cricket Club I' },
    { id: 2, name: 'Erlangen Cricket Club II' },
  ],
  clubOffice: 'treasurer',
  bio: 'Opening bowler and handy lower-order batter.',
}

export const PLAYER_WITHOUT_PHOTO: Player = {
  ...PLAYER,
  id: 3,
  slug: 'parikshhit-kulkarni',
  name: 'Parikshhit Kulkarni',
  photo: null,
  clubOffice: null,
  playingRole: 'batter',
}

const FIRST_NAMES = ['Arjun', 'Ben', 'Cem', 'David', 'Emil', 'Farhan', 'Gopal', 'Hamza', 'Imran']
const LAST_NAMES = ['Becker', 'Khan', 'Fischer', 'Patel', 'Wagner']
const ROLES = ['batter', 'bowler', 'all-rounder', 'wicketkeeper'] as const
const TEAMS = [
  { id: 1, name: 'Erlangen Cricket Club I' },
  { id: 2, name: 'Erlangen Cricket Club II' },
]

/**
 * A full-size fictional squad for Storybook: every name combination of the lists above, with
 * roles and teams assigned in turn. Every third player has no photo.
 */
export function createSquad(size: number): Player[] {
  return Array.from({ length: size }, (_, index) => {
    const firstName = FIRST_NAMES[index % FIRST_NAMES.length] ?? 'Alex'
    const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length] ?? 'Doe'
    const name = `${firstName} ${lastName}`
    return {
      ...PLAYER,
      id: index + 1,
      slug: `${firstName}-${lastName}`.toLowerCase(),
      name,
      photo: index % 3 === 2 ? null : PLAYER.photo,
      playingRole: ROLES[index % ROLES.length] ?? null,
      teams: TEAMS.filter((_, teamIndex) => teamIndex === index % TEAMS.length),
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
}

const ECC_I = { id: 1, name: 'Erlangen Cricket Club I', shortName: 'ECC-I' }
const ECC_II = { id: 14, name: 'Erlangen Cricket Club II', shortName: 'ECC-II' }

type BattingTotals = NonNullable<PlayerSeasonRecord['batting']>
type BowlingTotals = NonNullable<PlayerSeasonRecord['bowling']>

const batting = (overrides: Partial<BattingTotals>): BattingTotals => ({
  matches: 0,
  innings: 0,
  notOuts: 0,
  runs: 0,
  balls: 0,
  highestScore: 0,
  isHighestScoreNotOut: false,
  hundreds: 0,
  fifties: 0,
  fours: 0,
  sixes: 0,
  ...overrides,
})

const bowling = (overrides: Partial<BowlingTotals>): BowlingTotals => ({
  matches: 0,
  innings: 0,
  balls: 0,
  maidens: 0,
  runsConceded: 0,
  wickets: 0,
  bestFigures: null,
  dotBalls: 0,
  fourWicketHauls: 0,
  fiveWicketHauls: 0,
  hatTricks: 0,
  wides: 0,
  noBalls: 0,
  ...overrides,
})

const season = (overrides: Partial<PlayerSeasonRecord> & Pick<PlayerSeasonRecord, 'id'>) => ({
  season: 2026,
  competition: 'club' as const,
  format: 'all' as const,
  team: null,
  batting: null,
  bowling: null,
  ...overrides,
})

/**
 * As the league published them: two whole club seasons (all matches), the 2026 T20 part, each
 * team's 2026 league matches (ECC I and II; the season's other match was a friendly) and a 2026
 * district-team season.
 */
export const PLAYER_SEASONS: PlayerSeasonRecord[] = [
  season({
    id: 101,
    batting: batting({
      matches: 25,
      innings: 18,
      notOuts: 4,
      runs: 501,
      balls: 391,
      highestScore: 76,
      fifties: 3,
      fours: 56,
      sixes: 26,
    }),
    bowling: bowling({
      matches: 25,
      innings: 25,
      balls: 661,
      maidens: 5,
      runsConceded: 682,
      wickets: 56,
      bestFigures: { wickets: 6, runs: 12 },
      fourWicketHauls: 3,
      fiveWicketHauls: 1,
    }),
  }),
  season({
    id: 102,
    season: 2025,
    batting: batting({
      matches: 25,
      innings: 22,
      notOuts: 4,
      runs: 439,
      balls: 397,
      highestScore: 83,
      isHighestScoreNotOut: true,
      fifties: 2,
      fours: 37,
      sixes: 22,
    }),
    bowling: bowling({
      matches: 25,
      innings: 25,
      balls: 644,
      maidens: 2,
      runsConceded: 662,
      wickets: 31,
      bestFigures: { wickets: 3, runs: 9 },
    }),
  }),
  season({
    id: 103,
    competition: 'district',
    batting: batting({
      matches: 6,
      innings: 6,
      runs: 60,
      balls: 50,
      highestScore: 25,
      fours: 6,
      sixes: 2,
    }),
  }),
  season({
    id: 104,
    format: 't20',
    batting: batting({
      matches: 17,
      innings: 12,
      notOuts: 3,
      runs: 301,
      balls: 210,
      highestScore: 66,
      fifties: 2,
      fours: 30,
      sixes: 19,
    }),
    bowling: bowling({
      matches: 17,
      innings: 17,
      balls: 325,
      maidens: 1,
      runsConceded: 399,
      wickets: 36,
      bestFigures: { wickets: 6, runs: 12 },
      fourWicketHauls: 1,
      fiveWicketHauls: 1,
    }),
  }),
  season({
    id: 105,
    format: 'league',
    team: ECC_I,
    batting: batting({
      matches: 11,
      innings: 8,
      notOuts: 2,
      runs: 240,
      balls: 170,
      highestScore: 76,
      fifties: 2,
      fours: 25,
      sixes: 12,
    }),
    bowling: bowling({
      matches: 11,
      innings: 11,
      balls: 260,
      maidens: 2,
      runsConceded: 280,
      wickets: 25,
      bestFigures: { wickets: 6, runs: 12 },
      fourWicketHauls: 2,
      fiveWicketHauls: 1,
    }),
  }),
  season({
    id: 106,
    format: 'league',
    team: ECC_II,
    batting: batting({
      matches: 13,
      innings: 9,
      notOuts: 2,
      runs: 230,
      balls: 200,
      highestScore: 58,
      fifties: 1,
      fours: 28,
      sixes: 12,
    }),
    bowling: bowling({
      matches: 13,
      innings: 13,
      balls: 380,
      maidens: 3,
      runsConceded: 380,
      wickets: 29,
      bestFigures: { wickets: 4, runs: 20 },
      fourWicketHauls: 1,
    }),
  }),
]
