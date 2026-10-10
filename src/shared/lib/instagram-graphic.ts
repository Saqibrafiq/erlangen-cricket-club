export type GraphicRequest =
  | { kind: 'match'; fixtureId: number }
  | { kind: 'result'; fixtureId: number }
  | { kind: 'player'; slug: string }

const FIXTURE_FILE = /^(match|result)-(\d+)\.png$/
const PLAYER_FILE = /^player-([a-z0-9-]+)\.png$/

/** Parses a graphic's file name: "match-42.png", "result-42.png" or "player-saqib-rafiq.png". */
export function parseGraphicFile(file: string): GraphicRequest | null {
  const fixture = FIXTURE_FILE.exec(file)
  if (fixture?.[1] === 'match' || fixture?.[1] === 'result') {
    return { kind: fixture[1], fixtureId: Number(fixture[2]) }
  }

  const player = PLAYER_FILE.exec(file)
  return player?.[1] ? { kind: 'player', slug: player[1] } : null
}

/** Path of an Instagram graphic, e.g. "/instagram/de/result-42.png" (the extension skips the locale proxy). */
export function getGraphicPath(locale: string, request: GraphicRequest): string {
  const name =
    request.kind === 'player' ? `player-${request.slug}` : `${request.kind}-${request.fixtureId}`
  return `/instagram/${locale}/${name}.png`
}
