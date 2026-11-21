import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../../payload.config'
import { importSpielerpasses, type PassFile, planSpielerpassImport } from './import-spielerpasses'
import { parsePassText } from './parse-pass'
import { readPassPdf } from './read-pass-pdf'

// Entry point for `pnpm db:import:spielerpasses` (runs via `payload run`).
// SPIELERPASS_DIR names the folder of DCB Spielerpass PDFs; with DRY_RUN=1 it only reports what
// it would do, and writes nothing. The folder holds personal data: keep it out of the repository.
const folder = process.env.SPIELERPASS_DIR
if (!folder) throw new Error('Set SPIELERPASS_DIR to the folder of Spielerpass PDFs.')
const isDryRun = process.env.DRY_RUN === '1'

const files = (await readdir(folder)).filter((file) => file.toLowerCase().endsWith('.pdf')).sort()
const passes: PassFile[] = []
const unreadable: string[] = []
for (const file of files) {
  const pdf = await readPassPdf(new Uint8Array(await readFile(path.join(folder, file))))
  const details = parsePassText(pdf.text)
  if (details) passes.push({ file, details, image: pdf.image })
  else unreadable.push(file)
}

const payload = await getPayload({ config })
try {
  const plan = await planSpielerpassImport(payload, passes)
  payload.logger.info(
    [
      `${isDryRun ? 'DRY RUN: nothing written. ' : ''}${String(files.length)} PDFs read.`,
      `Matched (${String(plan.matched.length)}):`,
      ...plan.matched.map(
        ({ details, player, existing }) =>
          `  ${details.registeredName} -> ${player.name} (${details.passNumber}, ${existing ? 'update' : 'new'})`,
      ),
      `New players to create (${String(plan.newPlayers.length)}):`,
      ...plan.newPlayers.map(
        ({ file, details }) => `  ${details.registeredName} (${details.passNumber}, ${file})`,
      ),
      `Second pass for a matched player, skipped (${String(plan.duplicates.length)}): ${plan.duplicates.map(({ file }) => file).join(', ') || 'none'}`,
      `Not a Spielerpass (${String(unreadable.length)}): ${unreadable.join(', ') || 'none'}`,
    ].join('\n'),
  )
  if (!isDryRun) {
    const summary = await importSpielerpasses(payload, plan)
    payload.logger.info(
      `Spielerpasses: ${String(summary.created)} created, ${String(summary.updated)} updated. ` +
        `New players (${String(summary.playersCreated.length)}): ${summary.playersCreated.join(', ') || 'none'}.`,
    )
  }
} finally {
  await payload.destroy()
}
