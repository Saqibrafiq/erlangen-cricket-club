import { describe, expect, it } from 'vitest'

import { makePlayer } from '../test-factories'
import { pickFeaturedPlayers } from './home'

describe('pickFeaturedPlayers', () => {
  it('shows the players editors picked, in squad order, and only them', () => {
    const players = [
      makePlayer(1, 'Parikshhit'),
      makePlayer(2, 'Saqib', true, true),
      makePlayer(3, 'Ullas', false, true),
    ]

    expect(pickFeaturedPlayers(players).map((player) => player.id)).toEqual([2, 3])
  })

  it('puts players with a photo first, keeps squad order and fills one line-up', () => {
    const players = [
      makePlayer(1, 'Arun', false),
      ...[2, 3, 4, 5, 6, 7, 8].map((id) => makePlayer(id, `Player ${String(id)}`)),
    ]

    expect(pickFeaturedPlayers(players).map((player) => player.id)).toEqual([2, 3, 4, 5, 6, 7, 8])
  })

  it('still shows players without a photo when there are few', () => {
    const players = [makePlayer(1, 'Arun', false), makePlayer(2, 'Ullas')]

    expect(pickFeaturedPlayers(players).map((player) => player.id)).toEqual([2, 1])
  })
})
