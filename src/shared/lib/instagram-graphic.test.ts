import { describe, expect, it } from 'vitest'

import { getGraphicPath, parseGraphicFile } from './instagram-graphic'

describe('parseGraphicFile', () => {
  it('reads match and result graphics by fixture id', () => {
    expect(parseGraphicFile('match-42.png')).toEqual({ kind: 'match', fixtureId: 42 })
    expect(parseGraphicFile('result-7.png')).toEqual({ kind: 'result', fixtureId: 7 })
  })

  it('reads player graphics by slug', () => {
    expect(parseGraphicFile('player-saqib-rafiq.png')).toEqual({
      kind: 'player',
      slug: 'saqib-rafiq',
    })
  })

  it.each(['match-.png', 'result-42.jpg', 'team-1.png', 'player-.png', 'player-A_B.png', ''])(
    'rejects "%s"',
    (file) => {
      expect(parseGraphicFile(file)).toBeNull()
    },
  )
})

describe('getGraphicPath', () => {
  it('builds paths that parse back to the same request', () => {
    const path = getGraphicPath('de', { kind: 'result', fixtureId: 42 })

    expect(path).toBe('/instagram/de/result-42.png')
    expect(parseGraphicFile(path.split('/').at(-1) ?? '')).toEqual({
      kind: 'result',
      fixtureId: 42,
    })
    expect(getGraphicPath('en', { kind: 'player', slug: 'arun' })).toBe(
      '/instagram/en/player-arun.png',
    )
  })
})
