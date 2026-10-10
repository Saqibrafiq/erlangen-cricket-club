import type { ClubStandingCardProps } from '@/features/standings'
import type { Matchday } from '@/features/fixtures'
import type { InstagramPost } from '@/features/instagram'
import type { NewsSummary } from '@/features/news'
import type { Player } from '@/features/players'
import type { Sponsor } from '@/features/sponsors'

export type NextMatchLinks = {
  /** The fixture's calendar file (.ics). */
  calendarHref: string
  /** Kick-off as ISO date-time for the countdown; `null` while the start time is not known. */
  kickoff: string | null
}

export type ClubStandingEntry = ClubStandingCardProps & { key: string }

export type TrainingTime = {
  /** A date on the training weekday, for formatting its name in the visitor's language. */
  weekdayDate: Date
  /** HH:mm */
  startTime: string
  endTime: string
}

/** Everything the home page shows, gathered from the other features. */
export type HomeData = {
  matchday: Matchday
  nextMatch: NextMatchLinks | null
  standings: readonly ClubStandingEntry[]
  clubTeams: number
  /** Players for the squad scene (photos first, at most one line-up). */
  players: readonly Player[]
  /** Everyone in the squad, for "12 players". */
  squadSize: number
  news: readonly NewsSummary[]
  sponsors: readonly Sponsor[]
  /** Latest posts; `null` while the club has no Instagram profile set. */
  instagram: { profileUrl: string; handle: string | null; posts: readonly InstagramPost[] } | null
  training: TrainingTime | null
}
