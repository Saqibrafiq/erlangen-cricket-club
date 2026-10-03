// German umlauts are transliterated rather than stripped, so "Südost" becomes "suedost".
const GERMAN_TRANSLITERATION: Record<string, string> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
  Ä: 'Ae',
  Ö: 'Oe',
  Ü: 'Ue',
}

const COMBINING_MARKS = /[̀-ͯ]/g

/** Converts text to a lowercase, hyphen-separated URL segment, e.g. "Südost: Bayern 2026" → "suedost-bayern-2026". */
export function slugify(text: string): string {
  return text
    .replace(/[äöüßÄÖÜ]/g, (character) => GERMAN_TRANSLITERATION[character] ?? character)
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
