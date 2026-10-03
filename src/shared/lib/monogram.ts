const MAX_MONOGRAM_LENGTH = 3
// League codes end in a team number such as "-I" or " II"; the club part is what identifies them.
const TEAM_NUMBER_SUFFIX = /[\s-]+[IVX]+$/
const NON_ALPHANUMERIC = /[^A-Z0-9]/g

/**
 * Up to three letters identifying a club, e.g. "NCC-I" → "NCC", "SDTCC-II" → "SDT".
 * Falls back to "?" when nothing usable remains.
 */
export function getMonogram(shortName: string): string {
  const club = shortName
    .trim()
    .toUpperCase()
    .replace(TEAM_NUMBER_SUFFIX, '')
    .replace(NON_ALPHANUMERIC, '')
  return club.slice(0, MAX_MONOGRAM_LENGTH) || '?'
}
