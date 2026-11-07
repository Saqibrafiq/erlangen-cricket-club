export { calculateBattingAverage, calculateStrikeRate, STRIKE_RATE_BALLS } from './batting'
export {
  getTeamOutcome,
  getWinnerTeamId,
  resolveMatchResult,
  WICKETS_PER_INNINGS,
  type InningsScore,
  type MatchResult,
  type ResultInput,
  type ResultMargin,
  type ResultMarginUnit,
  type ResultMethod,
  type TeamKey,
  type TeamOutcome,
} from './match-result'
export { BALLS_PER_OVER, formatOvers, isValidOvers, parseOvers } from './overs'
export {
  calculateBowlingAverage,
  calculateBowlingStrikeRate,
  calculateEconomyRate,
  formatBowlingFigures,
  isBetterBowlingFigures,
  type BowlingFigures,
} from './bowling'
export {
  getDismissals,
  subtractBattingTotals,
  subtractBowlingTotals,
  sumBattingTotals,
  sumBowlingTotals,
  type BattingCounts,
  type BattingTotals,
  type BowlingCounts,
  type BowlingTotals,
} from './season-totals'
