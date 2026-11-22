import type { Payload, PayloadRequest } from 'payload'

import { slugify } from '../../shared/lib/slugify'
import { relationId } from '../access/roles'
import type { RevalidateContext } from '../hooks/revalidate-pages'
import { matchPlayerName } from '../seed/match-player-name'
import type { PassDetails } from './parse-pass'

/** A pass read from its PDF, ready to import. */
export type PassFile = {
  /** The PDF's file name, e.g. "Saqib_Rafiq.pdf", for the report and as a fallback name. */
  file: string
  details: PassDetails
  image: Buffer
}

type PlayerRef = { id: number; name: string }

const SCRIPT_CONTEXT: RevalidateContext = { disableRevalidate: true }

export type PlannedPass = PassFile & {
  player: PlayerRef
  /** The player's existing Spielerpass, which the import updates, or `null` to create one. */
  existing: { id: number; cardId: number | null } | null
}

export type SpielerpassPlan = {
  matched: PlannedPass[]
  /** Passes of people the club has no player for yet: the import creates the player. */
  newPlayers: PassFile[]
  /** A second pass for a player already matched: reported, never imported over the first. */
  duplicates: PassFile[]
}

export type SpielerpassImportSummary = {
  created: number
  updated: number
  playersCreated: string[]
}

/**
 * Players registered with the DCB under another name than the club uses, confirmed by the club
 * (2026-11-19). Keys are names as on the pass; values the name the club knows them by, which the
 * league alias table may map again to the website's name (e.g. Rohit Venkata → Rohit).
 */
export const CLUB_NAMES_BY_PASS_NAME: Readonly<Record<string, string>> = {
  'Abid Rahimzada': 'Abid Afg',
  'Ali Shan': 'Ali Shaan',
  'Arun Choudhary': 'Arun',
  'Bakhtiar Mohammad Younus': 'Mohammad Younus Bakhtiar',
  'Muhammad Akmal Sandhu': 'Akmal Sandhu',
  'Venkata Rohit Naidu Janapareddy': 'Rohit Venkata',
}

/**
 * The player a pass belongs to: by its registered name, then its file name; each as it is, or as
 * the club knows them (`CLUB_NAMES_BY_PASS_NAME`), through the league alias table.
 */
export function findPassPlayer<T extends PlayerRef>(
  pass: PassFile,
  players: readonly T[],
): T | null {
  for (const name of [pass.details.registeredName, nameFromFile(pass.file)]) {
    for (const candidate of [name, CLUB_NAMES_BY_PASS_NAME[name]]) {
      if (candidate === undefined) continue
      const player = matchPlayerName(candidate, players)
      if (player) return player
    }
  }
  return null
}

/** "Hassan Raza_Khan.pdf" → "Hassan Raza Khan": DCB exports name files first_last. */
export function nameFromFile(file: string): string {
  return file
    .replace(/\.pdf$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** A relationship's id, as this database always numbers them. */
const numericId = (value: unknown): number | null => {
  const id = relationId(value)
  return typeof id === 'number' ? id : null
}

/**
 * Matches each pass to a player (`findPassPlayer`). A pass without a player is planned as a new
 * player; a second pass for one player is reported, so nothing is overwritten by accident.
 */
export async function planSpielerpassImport(
  payload: Payload,
  passes: readonly PassFile[],
): Promise<SpielerpassPlan> {
  const [{ docs: players }, { docs: existing }] = await Promise.all([
    payload.find({ collection: 'players', limit: 0, depth: 0, pagination: false }),
    payload.find({ collection: 'spielerpasses', limit: 0, depth: 0, pagination: false }),
  ])
  const existingByPlayer = new Map(
    existing.map((pass) => [numericId(pass.player), { id: pass.id, cardId: numericId(pass.card) }]),
  )

  const plan: SpielerpassPlan = { matched: [], newPlayers: [], duplicates: [] }
  const taken = new Set<number>()
  for (const pass of passes) {
    const player = findPassPlayer(pass, players)
    if (!player) {
      plan.newPlayers.push(pass)
      continue
    }
    if (taken.has(player.id)) {
      plan.duplicates.push(pass)
      continue
    }
    taken.add(player.id)
    plan.matched.push({
      ...pass,
      player: { id: player.id, name: player.name },
      existing: existingByPlayer.get(player.id) ?? null,
    })
  }
  return plan
}

/** "Saqib Rafiq" → "spielerpass-saqib-rafiq.jpg": stable, readable file names in the admin. */
function cardFileName(registeredName: string): string {
  const slug = registeredName
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `spielerpass-${slug}.jpg`
}

/**
 * Writes the planned passes: each card image is uploaded (stored in the database, ADR-0025),
 * then the pass is created or updated; a replaced card image is deleted with its bytes.
 */
async function writePlan(
  payload: Payload,
  plan: SpielerpassPlan,
  req: Partial<PayloadRequest>,
): Promise<SpielerpassImportSummary> {
  const summary: SpielerpassImportSummary = { created: 0, updated: 0, playersCreated: [] }
  // A new player is created without team or publishing consent: hidden on the website until the
  // Board completes the record (consentedOrSignedIn).
  const created: PlannedPass[] = []
  for (const pass of plan.newPlayers) {
    const player = await payload.create({
      collection: 'players',
      data: {
        name: pass.details.registeredName,
        slug: slugify(pass.details.registeredName),
        isFeaturedOnHome: false,
        hasPublishConsent: false,
      },
      // A script has no Next.js request to revalidate pages in.
      context: SCRIPT_CONTEXT,
      overrideAccess: true,
      req,
    })
    summary.playersCreated.push(player.name)
    created.push({ ...pass, player: { id: player.id, name: player.name }, existing: null })
  }
  for (const pass of [...plan.matched, ...created]) {
    const card = await payload.create({
      collection: 'spielerpass-cards',
      data: {},
      file: {
        data: pass.image,
        mimetype: 'image/jpeg',
        name: cardFileName(pass.details.registeredName),
        size: pass.image.byteLength,
      },
      overrideAccess: true,
      req,
    })
    const data = {
      player: pass.player.id,
      registeredName: pass.details.registeredName,
      passNumber: pass.details.passNumber,
      validFrom: pass.details.validFrom ? `${pass.details.validFrom}T12:00:00.000Z` : null,
      card: card.id,
    }
    if (pass.existing) {
      await payload.update({
        collection: 'spielerpasses',
        id: pass.existing.id,
        data,
        overrideAccess: true,
        req,
      })
      if (pass.existing.cardId !== null) {
        await payload.delete({
          collection: 'spielerpass-cards',
          id: pass.existing.cardId,
          overrideAccess: true,
          req,
        })
      }
      summary.updated += 1
    } else {
      await payload.create({ collection: 'spielerpasses', data, overrideAccess: true, req })
      summary.created += 1
    }
  }
  return summary
}

/**
 * Writes the plan in one database transaction: either every pass, card and new player is saved,
 * or nothing is (the card bytes join it, since the storage adapter writes with the same request).
 */
export async function importSpielerpasses(
  payload: Payload,
  plan: SpielerpassPlan,
): Promise<SpielerpassImportSummary> {
  const transactionID = await payload.db.beginTransaction()
  try {
    const summary = await writePlan(payload, plan, transactionID === null ? {} : { transactionID })
    if (transactionID !== null) await payload.db.commitTransaction(transactionID)
    return summary
  } catch (error) {
    if (transactionID !== null) await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
