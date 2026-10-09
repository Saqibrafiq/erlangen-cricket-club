import { describe, expect, it } from 'vitest'

import type { Media, Player as PlayerDoc, Team } from '@/payload-types'

import { mapPlayer } from './map-player'

const TIMESTAMP = '2026-10-09T12:00:00.000Z'

const PHOTO: Media = {
  id: 4,
  alt: 'Sagar Suri in the club kit',
  url: '/api/media/file/player-sagar-suri.jpg',
  width: 640,
  height: 640,
  updatedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
}

const TEAM: Team = {
  id: 1,
  name: 'Erlangen Cricket Club I',
  shortName: 'ECC-I',
  isClubTeam: true,
  updatedAt: TIMESTAMP,
  createdAt: TIMESTAMP,
}

function playerDoc(overrides: Partial<PlayerDoc> = {}): PlayerDoc {
  return {
    id: 1,
    name: 'Sagar Suri',
    slug: 'sagar-suri',
    hasPublishConsent: true,
    updatedAt: TIMESTAMP,
    createdAt: TIMESTAMP,
    ...overrides,
  }
}

describe('mapPlayer', () => {
  it('maps a fully populated player', () => {
    const player = mapPlayer(
      playerDoc({
        photo: PHOTO,
        playingRole: 'all-rounder',
        battingStyle: 'right-hand',
        bowlingStyle: 'right-arm-medium',
        teams: [TEAM],
        clubOffice: 'president',
        bio: 'Captain and opening batter.',
      }),
    )

    expect(player).toEqual({
      id: 1,
      slug: 'sagar-suri',
      name: 'Sagar Suri',
      photo: { url: PHOTO.url, alt: PHOTO.alt, width: 640, height: 640 },
      playingRole: 'all-rounder',
      battingStyle: 'right-hand',
      bowlingStyle: 'right-arm-medium',
      teams: [{ id: 1, name: 'Erlangen Cricket Club I' }],
      clubOffice: 'president',
      bio: 'Captain and opening batter.',
    })
  })

  it('uses null and empty values for details that are not recorded', () => {
    expect(mapPlayer(playerDoc())).toMatchObject({
      photo: null,
      playingRole: null,
      battingStyle: null,
      bowlingStyle: null,
      teams: [],
      clubOffice: null,
      bio: null,
    })
  })

  it('drops unpopulated relations and photos without a file', () => {
    const player = mapPlayer(playerDoc({ photo: { ...PHOTO, url: null }, teams: [2, TEAM] }))

    expect(player.photo).toBeNull()
    expect(player.teams).toEqual([{ id: 1, name: 'Erlangen Cricket Club I' }])
  })
})
