import type { SeedTeam } from '../types'

/**
 * Teams referenced by the seed data. Opponents are stored by their league code until
 * editors add full names in the admin.
 */
export const SEED_TEAMS: SeedTeam[] = [
  { shortName: 'ECC-I', name: 'Erlangen Cricket Club I', isClubTeam: true },
  { shortName: 'ECC-II', name: 'Erlangen Cricket Club II', isClubTeam: true },
  { shortName: 'AUXCC', name: 'AUXCC' },
  { shortName: 'BACC', name: 'BACC' },
  { shortName: 'BATCC-I', name: 'BATCC-I' },
  { shortName: 'CCB-I', name: 'CCB-I' },
  { shortName: 'CCB-II', name: 'CCB-II' },
  { shortName: 'COCC', name: 'COCC' },
  { shortName: 'DWCC', name: 'DWCC' },
  { shortName: 'INCC-I', name: 'INCC-I' },
  { shortName: 'INRS', name: 'INRS' },
  { shortName: 'MCC-I', name: 'MCC-I' },
  { shortName: 'NCC-I', name: 'NCC-I' },
  { shortName: 'NCC-II', name: 'NCC-II' },
  { shortName: 'SDTCC-I', name: 'SDTCC-I' },
  { shortName: 'SDTCC-II', name: 'SDTCC-II' },
  { shortName: 'SGMC', name: 'SGMC' },
  { shortName: 'SKCC', name: 'SKCC' },
  { shortName: 'SSC-I', name: 'SSC-I' },
  { shortName: 'SVL-I', name: 'SVL-I' },
  { shortName: 'SVL-II', name: 'SVL-II' },
  { shortName: 'SVWB', name: 'SVWB' },
  { shortName: 'SWCC', name: 'SWCC' },
  { shortName: 'TSVGC', name: 'TSVGC' },
  { shortName: 'WUC', name: 'WUC' },
]
