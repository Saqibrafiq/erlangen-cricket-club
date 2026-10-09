import { describe, expect, it } from 'vitest'

import { PLAYER, PLAYER_WITH_DETAILS, PLAYER_WITHOUT_PHOTO } from '../test-factories'
import type { Player } from '../types'
import {
  buildPlayerJsonLd,
  buildPlayersJsonLd,
  getInitials,
  hasPlayingDetails,
  pickTeammates,
  searchPlayers,
  splitName,
} from './players'

const CLUB = { name: 'Erlangen Cricket Club', url: 'https://example.org' }

describe('getInitials', () => {
  it('uses the first and last name', () => {
    expect(getInitials('Mohammad Yasub')).toBe('MY')
    expect(getInitials('Anna Maria van der Berg')).toBe('AB')
  })

  it('uses one letter for a single name', () => {
    expect(getInitials('ullas')).toBe('U')
  })

  it('ignores surrounding and repeated spaces', () => {
    expect(getInitials('  Sagar   Suri ')).toBe('SS')
  })

  it('falls back to a question mark for an empty name', () => {
    expect(getInitials('   ')).toBe('?')
  })
})

describe('splitName', () => {
  it('puts the last word on its own and everything before it as the first name', () => {
    expect(splitName('Mohammad Yasub')).toEqual({ firstName: 'Mohammad', lastName: 'Yasub' })
    expect(splitName(' Anna  Maria Berg ')).toEqual({ firstName: 'Anna Maria', lastName: 'Berg' })
  })

  it('has no first name for a single name', () => {
    expect(splitName('Ullas')).toEqual({ firstName: null, lastName: 'Ullas' })
  })
})

describe('searchPlayers', () => {
  const squad = ['Sagar Suri', 'Sunny Kumar', 'José Pérez'].map((name, id) => ({
    ...PLAYER,
    id,
    name,
  }))
  const names = (players: readonly Player[]) => players.map((player) => player.name)

  it('finds players by any part of their name, ignoring case', () => {
    expect(names(searchPlayers(squad, 'SU'))).toEqual(['Sagar Suri', 'Sunny Kumar'])
    expect(names(searchPlayers(squad, 'kumar'))).toEqual(['Sunny Kumar'])
  })

  it('ignores accents and surrounding spaces', () => {
    expect(names(searchPlayers(squad, '  jose perez '))).toEqual(['José Pérez'])
  })

  it('returns everyone for an empty query and nobody for an unknown name', () => {
    expect(searchPlayers(squad, '')).toHaveLength(3)
    expect(searchPlayers(squad, 'xyz')).toEqual([])
  })
})

describe('hasPlayingDetails', () => {
  it('is false when nothing about the player’s game is recorded', () => {
    expect(hasPlayingDetails(PLAYER)).toBe(false)
  })

  it('ignores teams, which the profile shows in its header', () => {
    const teams = [{ id: 1, name: 'Erlangen Cricket Club I' }]
    expect(hasPlayingDetails({ ...PLAYER, teams })).toBe(false)
  })

  const details: [string, Partial<Player>][] = [
    ['playing role', { playingRole: 'bowler' }],
    ['batting style', { battingStyle: 'left-hand' }],
    ['bowling style', { bowlingStyle: 'left-arm-orthodox' }],
  ]

  it.each(details)('is true with only a %s', (_, detail) => {
    expect(hasPlayingDetails({ ...PLAYER, ...detail })).toBe(true)
  })
})

describe('pickTeammates', () => {
  const squad = ['a', 'b', 'c', 'd', 'e'].map((slug, id) => ({ ...PLAYER, id, slug }))
  const slugs = (players: readonly Player[]) => players.map((player) => player.slug)

  it('takes the players after the current one, wrapping around to the start', () => {
    expect(slugs(pickTeammates(squad, 'd', 3))).toEqual(['e', 'a', 'b'])
  })

  it('never includes the current player, even when asking for more than there are', () => {
    expect(slugs(pickTeammates(squad, 'a', 10))).toEqual(['b', 'c', 'd', 'e'])
  })

  it('takes the first players when the current one is not in the squad', () => {
    expect(slugs(pickTeammates(squad, 'x', 2))).toEqual(['a', 'b'])
  })
})

describe('buildPlayersJsonLd', () => {
  it('lists the squad as athletes of the club team with absolute photo URLs', () => {
    const jsonLd = buildPlayersJsonLd([PLAYER, PLAYER_WITHOUT_PHOTO], CLUB, (player) => {
      return `${CLUB.url}/players/${player.slug}`
    })

    expect(jsonLd).toMatchObject({ '@type': 'SportsTeam', name: CLUB.name, sport: 'Cricket' })
    expect(jsonLd.athlete).toEqual([
      {
        '@type': 'Person',
        name: 'Sagar Suri',
        url: 'https://example.org/players/sagar-suri',
        image: 'https://example.org/api/media/file/player-sagar-suri.jpg',
      },
      {
        '@type': 'Person',
        name: 'Parikshhit Kulkarni',
        url: 'https://example.org/players/parikshhit-kulkarni',
      },
    ])
  })
})

describe('buildPlayerJsonLd', () => {
  it('describes the player as a member of the club', () => {
    const photo = { url: 'https://cdn.example.org/jonas.jpg', alt: '', width: 1, height: 1 }
    const jsonLd = buildPlayerJsonLd(
      { ...PLAYER_WITH_DETAILS, photo },
      'https://example.org/players/jonas-becker',
      CLUB,
    )

    expect(jsonLd).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Jonas Becker',
      url: 'https://example.org/players/jonas-becker',
      image: 'https://cdn.example.org/jonas.jpg',
      memberOf: { '@type': 'SportsTeam', name: CLUB.name, sport: 'Cricket', url: CLUB.url },
    })
  })
})
