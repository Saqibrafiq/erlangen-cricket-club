import { useFormatter } from 'next-intl'

// Same precision as the published CricClubs tables.
const NET_RUN_RATE_DIGITS = 4
const WIN_RATE_DIGITS = 2
const PERCENT = 100

/** Formats standings values exactly as the league publishes them, in the current locale. */
export function useStandingsFormat() {
  const format = useFormatter()

  return {
    /** 71.43 → "71.43%" */
    winRate: (percentage: number) =>
      format.number(percentage / PERCENT, {
        style: 'percent',
        minimumFractionDigits: WIN_RATE_DIGITS,
        maximumFractionDigits: WIN_RATE_DIGITS,
      }),
    /** -0.1 → "-0.1000" */
    netRunRate: (value: number) =>
      format.number(value, {
        minimumFractionDigits: NET_RUN_RATE_DIGITS,
        maximumFractionDigits: NET_RUN_RATE_DIGITS,
      }),
  }
}
