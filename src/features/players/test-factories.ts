import type { Player } from './types'

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
