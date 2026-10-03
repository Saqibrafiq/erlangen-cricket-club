/**
 * ECC-I in the BCV T20 Regionalliga Bayern 2026, transcribed from the league's CricClubs
 * team results page. Teams are listed in batting order.
 */
import type { SeedCompetitionData, SeedFixture } from '../types'

const COMPETITION = {
  name: 'BCV T20 Regionalliga Bayern',
  season: '2026',
  maxOvers: 20,
}

const KEY_PREFIX = 'bcv-t20-2026'

const FIXTURES: SeedFixture[] = [
  {
    importKey: `${KEY_PREFIX}-2026-09-06-1`,
    date: '2026-09-06',
    stage: 'final',
    innings: [
      { team: 'NCC-I', runs: 236, wickets: 5, overs: '20', maxOvers: 20 },
      { team: 'ECC-I', runs: 204, wickets: 10, overs: '19.2', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-09-05-1`,
    date: '2026-09-05',
    stage: 'qualifier',
    innings: [
      { team: 'ECC-I', runs: 204, wickets: 7, overs: '20', maxOvers: 20 },
      { team: 'TSVGC', runs: 86, wickets: 10, overs: '15.5', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-22-1`,
    date: '2026-08-22',
    stage: 'league',
    innings: [
      { team: 'SDTCC-I', runs: 138, wickets: 3, overs: '15', maxOvers: 15 },
      { team: 'ECC-I', runs: 137, wickets: 7, overs: '15', maxOvers: 15 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-22-2`,
    date: '2026-08-22',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 116, wickets: 2, overs: '14', maxOvers: 14 },
      { team: 'SDTCC-I', runs: 110, wickets: 6, overs: '10', maxOvers: 10 },
    ],
    result: { method: 'dls', winner: null },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-09-1`,
    date: '2026-08-09',
    stage: 'league',
    innings: [
      { team: 'NCC-I', runs: 176, wickets: 10, overs: '18.1', maxOvers: 20 },
      { team: 'ECC-I', runs: 182, wickets: 2, overs: '14.5', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-09-2`,
    date: '2026-08-09',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 236, wickets: 3, overs: '20', maxOvers: 20 },
      { team: 'NCC-I', runs: 235, wickets: 6, overs: '20', maxOvers: 20 },
    ],
    result: { method: 'forfeit', winner: 'NCC-I' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-08-01-1`,
    date: '2026-08-01',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 183, wickets: 7, overs: '20', maxOvers: 20 },
      { team: 'SVL-I', runs: 138, wickets: 8, overs: '20', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    // Second innings was not played; the league recorded a DLS tie.
    importKey: `${KEY_PREFIX}-2026-08-01-2`,
    date: '2026-08-01',
    stage: 'league',
    teams: ['SVL-I', 'ECC-I'],
    innings: [{ team: 'SVL-I', runs: 156, wickets: 8, overs: '20', maxOvers: 20 }],
    result: { method: 'dls', winner: null },
  },
  {
    importKey: `${KEY_PREFIX}-2026-06-06-1`,
    date: '2026-06-06',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 277, wickets: 4, overs: '20', maxOvers: 20 },
      { team: 'SKCC', runs: 91, wickets: 10, overs: '14.1', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-06-06-2`,
    date: '2026-06-06',
    stage: 'league',
    innings: [
      { team: 'SKCC', runs: 170, wickets: 10, overs: '19.4', maxOvers: 20 },
      { team: 'ECC-I', runs: 171, wickets: 7, overs: '19', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-31-1`,
    date: '2026-05-31',
    stage: 'league',
    innings: [
      { team: 'CCB-II', runs: 187, wickets: 7, overs: '20', maxOvers: 20 },
      { team: 'ECC-I', runs: 62, wickets: 6, overs: '8', maxOvers: 8 },
    ],
    result: { method: 'dls', winner: 'CCB-II', margin: { unit: 'runs', value: 51 } },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-31-2`,
    date: '2026-05-31',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 216, wickets: 6, overs: '20', maxOvers: 20 },
      { team: 'CCB-II', runs: 212, wickets: 9, overs: '20', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-23-1`,
    date: '2026-05-23',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 142, wickets: 10, overs: '19.3', maxOvers: 20 },
      { team: 'MCC-I', runs: 112, wickets: 7, overs: '20', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-23-2`,
    date: '2026-05-23',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 152, wickets: 6, overs: '20', maxOvers: 20 },
      { team: 'MCC-I', runs: 98, wickets: 9, overs: '20', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-17-1`,
    date: '2026-05-17',
    stage: 'league',
    innings: [
      { team: 'ECC-I', runs: 193, wickets: 7, overs: '20', maxOvers: 20 },
      { team: 'TSVGC', runs: 110, wickets: 7, overs: '14', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
  {
    importKey: `${KEY_PREFIX}-2026-05-17-2`,
    date: '2026-05-17',
    stage: 'league',
    innings: [
      { team: 'TSVGC', runs: 128, wickets: 10, overs: '16.2', maxOvers: 20 },
      { team: 'ECC-I', runs: 129, wickets: 5, overs: '16.5', maxOvers: 20 },
    ],
    result: { method: 'normal' },
  },
]

export const BCV_T20_REGIONALLIGA_2026: SeedCompetitionData = {
  competition: COMPETITION,
  fixtures: FIXTURES,
}
