export type PlayingRole = 'batter' | 'bowler' | 'all-rounder' | 'wicketkeeper'

export type BattingStyle = 'right-hand' | 'left-hand'

export type BowlingStyle =
  | 'right-arm-fast'
  | 'right-arm-medium'
  | 'right-arm-off-spin'
  | 'right-arm-leg-spin'
  | 'left-arm-fast'
  | 'left-arm-medium'
  | 'left-arm-orthodox'
  | 'left-arm-wrist-spin'

export type ClubOffice = 'president' | 'vice-president' | 'treasurer' | 'secretary'

export type PlayerPhoto = {
  url: string
  alt: string
  width: number
  height: number
}

export type PlayerTeam = {
  id: number
  name: string
}

/** A player who agreed to appear on the website. */
export type Player = {
  id: number
  slug: string
  name: string
  photo: PlayerPhoto | null
  playingRole: PlayingRole | null
  battingStyle: BattingStyle | null
  bowlingStyle: BowlingStyle | null
  teams: PlayerTeam[]
  clubOffice: ClubOffice | null
  bio: string | null
  /** Editors pick who stands in the home page's squad line-up. */
  isFeaturedOnHome: boolean
}
