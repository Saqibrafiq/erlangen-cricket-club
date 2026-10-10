import { PALETTE } from '../palette'

export type GraphicTeam = {
  name: string
  isClubTeam: boolean
  /** "182/6 (20)" for results; left out for upcoming matches. */
  score?: string
}

function Pill({ text, isStrong }: { text: string; isStrong: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignSelf: 'flex-start',
        padding: '10px 28px',
        borderRadius: 999,
        fontSize: 30,
        fontWeight: 500,
        backgroundColor: isStrong ? PALETTE.textOnMedia : 'rgba(252, 252, 252, 0.15)',
        color: isStrong ? PALETTE.mediaOverlay : PALETTE.textOnMedia,
      }}
    >
      {text}
    </div>
  )
}

function TeamLine({ team }: { team: GraphicTeam }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24 }}
    >
      <div
        style={{
          display: 'flex',
          fontFamily: 'Barlow Condensed',
          fontWeight: team.isClubTeam ? 700 : 600,
          fontSize: 72,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          color: team.isClubTeam ? PALETTE.textOnMedia : PALETTE.muted,
        }}
      >
        {team.name}
      </div>
      {team.score && (
        <div
          style={{
            display: 'flex',
            fontFamily: 'Barlow Condensed',
            fontWeight: 700,
            fontSize: 72,
          }}
        >
          {team.score}
        </div>
      )}
    </div>
  )
}

export type MatchGraphicBodyProps = {
  competition: string
  teams: readonly [GraphicTeam, GraphicTeam]
  versus: string
  /** "Home game" or "Away game", when the ground is known. */
  venueKind: string | null
  /** e.g. "Saturday, 13 October" */
  date: string
  /** e.g. "Kick-off 11:00" */
  time: string | null
  venue: string | null
}

/** An upcoming match: teams, date, kick-off and ground. */
export function MatchGraphicBody({
  competition,
  teams,
  versus,
  venueKind,
  date,
  time,
  venue,
}: MatchGraphicBodyProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 28 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {venueKind && <Pill text={venueKind} isStrong />}
        <Pill text={competition} isStrong={false} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 24 }}>
        <TeamLine team={teams[0]} />
        <div style={{ display: 'flex', fontSize: 40, color: PALETTE.muted }}>{versus}</div>
        <TeamLine team={teams[1]} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 24,
          paddingTop: 32,
          borderTop: `3px solid ${PALETTE.dots}`,
          fontSize: 40,
        }}
      >
        <div style={{ display: 'flex', fontWeight: 500 }}>{time ? `${date} · ${time}` : date}</div>
        {venue && <div style={{ display: 'flex', color: PALETTE.muted }}>{venue}</div>}
      </div>
    </div>
  )
}

export type ResultGraphicBodyProps = {
  competition: string
  date: string
  teams: readonly [GraphicTeam, GraphicTeam]
  /** e.g. "Erlangen Cricket Club I won by 118 runs" */
  result: string
  /** "Won", "Lost"… from the club's view, when a club team played. */
  outcome: string | null
  hasClubWon: boolean
}

/** A played match: both scores, the result line and the club's outcome. */
export function ResultGraphicBody({
  competition,
  date,
  teams,
  result,
  outcome,
  hasClubWon,
}: ResultGraphicBodyProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 28 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {outcome && <Pill text={outcome} isStrong={hasClubWon} />}
        <Pill text={`${competition} · ${date}`} isStrong={false} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 24 }}>
        <TeamLine team={teams[0]} />
        <TeamLine team={teams[1]} />
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 24,
          paddingTop: 32,
          borderTop: `3px solid ${PALETTE.dots}`,
          fontSize: 44,
          fontWeight: 500,
        }}
      >
        {result}
      </div>
    </div>
  )
}
