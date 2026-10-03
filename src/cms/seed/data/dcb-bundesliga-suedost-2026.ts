/**
 * ECC-I in the DCB-Bundesliga Südost: Bayern 2026 (50 overs), transcribed from the league's
 * CricClubs team results page. Teams are listed in batting order.
 */
import type { SeedCompetitionData, SeedFixture } from '../types'

const COMPETITION = {
  name: 'DCB-Bundesliga Südost: Bayern',
  season: '2026',
  maxOvers: 50,
}

const KEY_PREFIX = 'dcb-bl-suedost-2026'

const FIXTURES: SeedFixture[] = [
  {
    // Forfeited before play: no innings.
    importKey: `${KEY_PREFIX}-2026-07-25-1`,
    date: '2026-07-25',
    stage: 'league',
    teams: ['DWCC', 'ECC-I'],
    innings: [],
    result: { method: 'forfeit', winner: 'DWCC' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-07-18-1`,
    date: '2026-07-18',
    stage: 'league',
    teams: ['SVWB', 'ECC-I'],
    innings: [],
    result: { method: 'forfeit', winner: 'SVWB' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-07-12-1`,
    date: '2026-07-12',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 336, wickets: 9, overs: '48.4', maxOvers: 50 },
      { team: 'NCC-I', runs: 337, wickets: 6, overs: '48.4', maxOvers: 50 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-07-05-1`,
    date: '2026-07-05',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 275, wickets: 10, overs: '45', maxOvers: 50 },
      { team: 'INCC-I', runs: 181, wickets: 10, overs: '36.5', maxOvers: 50 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-06-28-1`,
    date: '2026-06-28',
    stage: 'league',
    innings: [
      { team: 'SDTCC-I', runs: 207, wickets: 10, overs: '48.3', maxOvers: 50 },
      { team: 'ECC-I', runs: 208, wickets: 4, overs: '33.2', maxOvers: 50 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-02-1`,
    date: '2026-05-02',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 280, wickets: 10, overs: '47', maxOvers: 50 },
      { team: 'MCC-I', runs: 158, wickets: 10, overs: '39.2', maxOvers: 50 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-04-25-1`,
    date: '2026-04-25',
    stage: 'league',
    innings: [
      { team: 'SSC-I', runs: 150, wickets: 10, overs: '32', maxOvers: 50 },
      { team: 'ECC-I', runs: 152, wickets: 7, overs: '23.1', maxOvers: 50 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-04-18-1`,
    date: '2026-04-18',
    stage: 'league',
    innings: [
      { team: 'SVL-I', runs: 158, wickets: 10, overs: '29.4', maxOvers: 50 },
      { team: 'ECC-I', runs: 159, wickets: 7, overs: '27.2', maxOvers: 50 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-04-11-1`,
    date: '2026-04-11',
    stage: 'league',
    innings: [
      { team: 'CCB-I', runs: 290, wickets: 10, overs: '48.5', maxOvers: 50 },
      { team: 'ECC-I', runs: 182, wickets: 10, overs: '33.3', maxOvers: 50 },
    ],
    result: { method: 'normal' },
  },
]

export const DCB_BUNDESLIGA_SUEDOST_2026: SeedCompetitionData = {
  competition: COMPETITION,
  fixtures: FIXTURES,
}
