/** What the app needs from a DCB Spielerpass; the date of birth is deliberately left out. */
export type PassDetails = {
  /** The name exactly as registered, for the match report sheet. */
  registeredName: string
  passNumber: string
  /** "Gültig ab" as YYYY-MM-DD, or `null` if the pass has none. */
  validFrom: string | null
}

const LABEL = { name: 'Name:', validFrom: 'Gültig ab:' } as const
/** "Nr. : DCB0M40738", or the label and the number as separate items. */
const PASS_NUMBER = /^Nr\.\s*:\s*(\S+)$/
const PASS_NUMBER_LABEL = /^Nr\.\s*:$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

const valueAfter = (items: readonly string[], label: string): string | undefined => {
  const index = items.indexOf(label)
  return index === -1 ? undefined : items[index + 1]
}

function findPassNumber(items: readonly string[]): string | undefined {
  for (const [index, item] of items.entries()) {
    const inline = PASS_NUMBER.exec(item)
    if (inline) return inline[1]
    if (PASS_NUMBER_LABEL.test(item)) return items[index + 1]
  }
  return undefined
}

/**
 * Reads the details from the text of a DCB Spielerpass PDF, in reading order: "Name:" and the
 * name, "Gültig ab:" and the date, "Nr. :" and the number.
 *
 * @returns The details, or `null` when the text is not a Spielerpass.
 */
export function parsePassText(items: readonly string[]): PassDetails | null {
  const texts = items.map((item) => item.trim()).filter(Boolean)
  const registeredName = valueAfter(texts, LABEL.name)
  const passNumber = findPassNumber(texts)
  if (!registeredName || !passNumber) return null
  const validFrom = valueAfter(texts, LABEL.validFrom)
  return {
    registeredName: registeredName.replace(/\s+/g, ' '),
    passNumber,
    validFrom: validFrom && DATE.test(validFrom) ? validFrom : null,
  }
}
