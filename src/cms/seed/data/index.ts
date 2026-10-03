import type { SeedCompetitionData } from '../types'
import { BCV_REGIONALLIGA_2026 } from './bcv-regionalliga-2026'
import { BCV_T20_REGIONALLIGA_2026 } from './bcv-t20-regionalliga-2026'
import { BCV_T20_VERBANDSLIGA_2026 } from './bcv-t20-verbandsliga-2026'
import { DCB_BUNDESLIGA_SUEDOST_2026 } from './dcb-bundesliga-suedost-2026'

export { SEED_TEAMS } from './teams'

export const SEED_COMPETITIONS: readonly SeedCompetitionData[] = [
  DCB_BUNDESLIGA_SUEDOST_2026,
  BCV_T20_REGIONALLIGA_2026,
  BCV_REGIONALLIGA_2026,
  BCV_T20_VERBANDSLIGA_2026,
]
