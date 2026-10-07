export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

export type MembershipFee = {
  name: string
  /** Shown as a checklist. */
  includes: readonly string[]
  /** Euros per year. */
  annualFee: number
  /** Euros per year for youth (up to 18) and students, if reduced. */
  reducedFee: number | null
  /** Euros per tournament match, if charged. */
  perMatchFee: number | null
  isHighlighted: boolean
}

/** A weekly session, e.g. training on Thursdays or match days at the weekend. */
export type ClubSession = {
  title: string
  days: readonly Weekday[]
  /** HH:mm */
  startTime: string
  endTime: string
  venue: string
}

export type MembershipImage = {
  url: string
  alt: string
  width: number
  height: number
}

export type DownloadableDocument = {
  title: string
  url: string
}

export type MembershipInfo = {
  heroImage: MembershipImage | null
  fees: readonly MembershipFee[]
  feesNote: string | null
  terms: string | null
  applicationForm: DownloadableDocument | null
  sessions: readonly ClubSession[]
  sessionsNote: string | null
}
