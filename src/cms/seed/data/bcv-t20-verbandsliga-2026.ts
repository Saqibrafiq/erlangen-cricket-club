/**
 * ECC-II in the BCV T20 1. Verbandsliga 2026, transcribed from the league's CricClubs team
 * results page. Teams are listed in batting order. "Forfeited. Winner: X" is stored as a
 * forfeit; "Winner: X" without play as a walkover.
 */
import type { SeedCompetitionData, SeedFixture } from '../types'

const COMPETITION = {
  name: 'BCV T20 1. Verbandsliga',
  season: '2026',
  maxOvers: 20,
}

const KEY_PREFIX = 'bcv-t20-vl-2026'

const FIXTURES: SeedFixture[] = [
  {
    importKey: `${KEY_PREFIX}-2026-08-29-1`,
    date: '2026-08-29',
    stage: 'league',
    innings: [
      { team: 'ECC-II', runs: 173, wickets: 7, overs: '20', maxOvers: 20 },
      { team: 'NCC-II', runs: 71, wickets: 10, overs: '9.5', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-29-2`,
    date: '2026-08-29',
    stage: 'league',
    innings: [
      { team: 'NCC-II', runs: 178, wickets: 7, overs: '20', maxOvers: 20 },
      { team: 'ECC-II', runs: 145, wickets: 8, overs: '20', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-23-1`,
    date: '2026-08-23',
    stage: 'league',
    teams: ['ECC-II', 'SDTCC-II'],
    innings: [],
    result: { method: 'forfeit', winner: 'ECC-II' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-23-2`,
    date: '2026-08-23',
    stage: 'league',
    teams: ['ECC-II', 'SDTCC-II'],
    innings: [],
    result: { method: 'forfeit', winner: 'ECC-II' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-08-1`,
    date: '2026-08-08',
    stage: 'league',
    innings: [
      { team: 'ECC-II', runs: 133, wickets: 10, overs: '19.3', maxOvers: 20 },
      { team: 'BACC', runs: 134, wickets: 2, overs: '12.1', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-08-2`,
    date: '2026-08-08',
    stage: 'league',
    innings: [
      { team: 'BACC', runs: 209, wickets: 10, overs: '20', maxOvers: 20 },
      { team: 'ECC-II', runs: 135, wickets: 9, overs: '20', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-02-1`,
    date: '2026-08-02',
    stage: 'league',
    innings: [
      { team: 'INRS', runs: 126, wickets: 10, overs: '19.5', maxOvers: 20 },
      { team: 'ECC-II', runs: 132, wickets: 4, overs: '14.1', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-02-2`,
    date: '2026-08-02',
    stage: 'league',
    innings: [
      { team: 'INRS', runs: 148, wickets: 8, overs: '20', maxOvers: 20 },
      { team: 'ECC-II', runs: 151, wickets: 3, overs: '15.3', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-06-06-1`,
    date: '2026-06-06',
    stage: 'league',
    teams: ['AUXCC', 'ECC-II'],
    innings: [],
    result: { method: 'walkover', winner: 'AUXCC' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-06-06-2`,
    date: '2026-06-06',
    stage: 'league',
    teams: ['AUXCC', 'ECC-II'],
    innings: [],
    result: { method: 'walkover', winner: 'AUXCC' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-23-1`,
    date: '2026-05-23',
    stage: 'league',
    innings: [
      { team: 'WUC', runs: 138, wickets: 10, overs: '17.3', maxOvers: 20 },
      { team: 'ECC-II', runs: 91, wickets: 8, overs: '14.2', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-23-2`,
    date: '2026-05-23',
    stage: 'league',
    innings: [
      { team: 'WUC', runs: 182, wickets: 8, overs: '20', maxOvers: 20 },
      { team: 'ECC-II', runs: 154, wickets: 9, overs: '19.1', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-16-1`,
    date: '2026-05-16',
    stage: 'league',
    innings: [
      { team: 'ECC-II', runs: 165, wickets: 4, overs: '14', maxOvers: 14 },
      { team: 'INCC-I', runs: 177, wickets: 4, overs: '12.5', maxOvers: 14 },
    ],
    result: { method: 'dls', winner: 'INCC-I', margin: { unit: 'wickets', value: 6 } },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-16-2`,
    date: '2026-05-16',
    stage: 'league',
    innings: [
      { team: 'INCC-I', runs: 81, wickets: 10, overs: '20', maxOvers: 20 },
      { team: 'ECC-II', runs: 85, wickets: 1, overs: '12.3', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-10-1`,
    date: '2026-05-10',
    stage: 'league',
    innings: [
      { team: 'ECC-II', runs: 192, wickets: 3, overs: '20', maxOvers: 20 },
      { team: 'BATCC-I', runs: 193, wickets: 8, overs: '19.3', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-10-2`,
    date: '2026-05-10',
    stage: 'league',
    innings: [
      { team: 'ECC-II', runs: 138, wickets: 10, overs: '20', maxOvers: 20 },
      { team: 'BATCC-I', runs: 102, wickets: 10, overs: '15.5', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
]

export const BCV_T20_VERBANDSLIGA_2026: SeedCompetitionData = {
  competition: COMPETITION,
  fixtures: FIXTURES,
}
