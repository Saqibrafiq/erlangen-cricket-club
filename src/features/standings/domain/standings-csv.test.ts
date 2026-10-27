import { describe, expect, it } from 'vitest'

import { parseStandingsCsv, STANDINGS_CSV_MAX_BYTES } from './standings-csv'

/** CricClubs' "viewPointsTableExcel.csv", as exported (leading blank line, padded headers). */
const CRICCLUBS_EXPORT = `
  SNO ,TEAM , MAT, WON, LOST , N/R, TIE, PTS, WIN%,NET RR, FOR, AGAINST
1,TSVGC,14,10,4,0,0,80.0,71.43%,1.426,2185/243.4,2016/267.2
2,ECC-I,14,9,3,0,2,80.0,75.00%,1.1694,1954/243.4,1596/233
5,SVL-I,14,8,5,0,1,68.0,61.54%,-0.2636,1607/248.1,1778/263.5
`
const HEADER = 'TEAM,MAT,WON,LOST,N/R,TIE,PTS,WIN%,NET RR,FOR,AGAINST'

describe('parseStandingsCsv', () => {
  it('reads a CricClubs points table export in published order', () => {
    const result = parseStandingsCsv(CRICCLUBS_EXPORT)

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.rows.map((row) => row.teamShortName)).toEqual(['TSVGC', 'ECC-I', 'SVL-I'])
    expect(result.rows[1]).toEqual({
      teamShortName: 'ECC-I',
      played: 14,
      won: 9,
      lost: 3,
      noResult: 0,
      tied: 2,
      points: 80,
      winRate: 75,
      netRunRate: 1.1694,
      runsFor: 1954,
      oversFaced: '243.4',
      runsAgainst: 1596,
      oversBowled: '233',
    })
    expect(result.rows[2]?.netRunRate).toBe(-0.2636)
  })

  it('finds columns by header, in any order', () => {
    const result = parseStandingsCsv(
      'AGAINST,FOR,NET RR,WIN%,PTS,TIE,N/R,LOST,WON,MAT,TEAM\n10/2,20/3,0.5,50%,4,0,0,1,1,2,ECC-II',
    )

    expect(result).toMatchObject({
      success: true,
      rows: [{ teamShortName: 'ECC-II', runsFor: 20, runsAgainst: 10, played: 2 }],
    })
  })

  it('names every missing column', () => {
    expect(parseStandingsCsv('TEAM,MAT\nECC-I,1')).toEqual({
      success: false,
      errors: ['WON', 'LOST', 'N/R', 'TIE', 'PTS', 'WIN%', 'NET RR', 'FOR', 'AGAINST'].map(
        (column) => ({ code: 'missingColumn', column }),
      ),
    })
  })

  it('reports each bad cell with its line and column', () => {
    const result = parseStandingsCsv(`${HEADER}\n,14,x,4,0,0,8.5,abc,1.2,2185-243,2016/267.7`)

    expect(result).toEqual({
      success: false,
      errors: [
        { code: 'missingTeam', line: 2, column: 'TEAM', value: '' },
        { code: 'notCount', line: 2, column: 'WON', value: 'x' },
        { code: 'notCount', line: 2, column: 'PTS', value: '8.5' },
        { code: 'notNumber', line: 2, column: 'WIN%', value: 'abc' },
        { code: 'notRunsOvers', line: 2, column: 'FOR', value: '2185-243' },
        { code: 'notRunsOvers', line: 2, column: 'AGAINST', value: '2016/267.7' },
      ],
    })
  })

  it('rejects a bad net run rate and runs/overs with extra parts', () => {
    const result = parseStandingsCsv(`${HEADER}\nECC-I,1,1,0,0,0,2,100%,fast,1/2/3,1/1`)

    expect(result).toMatchObject({
      success: false,
      errors: [
        { code: 'notNumber', column: 'NET RR' },
        { code: 'notRunsOvers', column: 'FOR' },
      ],
    })
  })

  it('rejects a team listed twice', () => {
    const row = 'ECC-I,1,1,0,0,0,2,100%,1,10/2,5/2'

    expect(parseStandingsCsv(`${HEADER}\n${row}\n${row}`)).toEqual({
      success: false,
      errors: [{ code: 'duplicateTeam', line: 3, column: 'TEAM', value: 'ECC-I' }],
    })
  })

  it('rejects an empty file, a header without rows and oversized files', () => {
    expect(parseStandingsCsv('')).toEqual({ success: false, errors: [{ code: 'empty' }] })
    expect(parseStandingsCsv(HEADER)).toEqual({ success: false, errors: [{ code: 'noRows' }] })
    expect(parseStandingsCsv('x'.repeat(STANDINGS_CSV_MAX_BYTES + 1))).toEqual({
      success: false,
      errors: [{ code: 'tooLarge' }],
    })
  })
})
