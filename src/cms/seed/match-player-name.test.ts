import { describe, expect, it } from 'vitest'

import { matchPlayerName } from './match-player-name'

const PLAYERS = [
  { id: 1, name: 'Saqib Rafiq' },
  { id: 2, name: 'Arun' },
  { id: 3, name: 'Parikshhit Kulkarni' },
]
const ALIASES = { 'Arun Chaudhary': 'Arun', 'Parikshit Kulkarni': 'Parikshhit Kulkarni' }

describe('matchPlayerName', () => {
  it('finds a player listed under the same name, ignoring case and spacing', () => {
    expect(matchPlayerName('saqib  rafiq ', PLAYERS, ALIASES)?.id).toBe(1)
  })

  it('finds a player the site lists under a shorter or different name', () => {
    expect(matchPlayerName('Arun Chaudhary', PLAYERS, ALIASES)?.id).toBe(2)
    expect(matchPlayerName('Parikshit Kulkarni', PLAYERS, ALIASES)?.id).toBe(3)
  })

  it('returns null for a player the site does not list yet', () => {
    expect(matchPlayerName('Karan Chadha', PLAYERS, ALIASES)).toBeNull()
  })

  it('uses the club’s alias table by default', () => {
    expect(matchPlayerName('Arun Chaudhary', PLAYERS)?.id).toBe(2)
  })
})
