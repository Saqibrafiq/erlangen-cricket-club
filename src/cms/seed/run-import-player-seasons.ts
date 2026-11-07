import { getPayload } from 'payload'

import config from '../../payload.config'
import { importPlayerSeasons, planPlayerSeasonImport } from './import-player-seasons'

// Entry point for `pnpm db:import:player-seasons` (runs via `payload run`).
// With DRY_RUN=1 it only reports what it would do, and writes nothing.
const isDryRun = process.env.DRY_RUN === '1'
const payload = await getPayload({ config })

try {
  if (isDryRun) {
    const plan = await planPlayerSeasonImport(payload)
    payload.logger.info(
      [
        `DRY RUN: nothing written. ${String(plan.seasons)} season records.`,
        `Matched (${String(plan.matched.length)}):`,
        ...plan.matched.map(({ leagueName, siteName }) =>
          leagueName === siteName ? `  ${leagueName}` : `  ${leagueName} -> ${siteName}`,
        ),
        `New players (${String(plan.newPlayers.length)}): ${plan.newPlayers.join(', ') || 'none'}`,
        `New teams: ${plan.newTeams.join(', ') || 'none'}`,
      ].join('\n'),
    )
  } else {
    const summary = await importPlayerSeasons(payload)
    payload.logger.info(
      `Player seasons: ${String(summary.seasonsCreated)} created, ${String(summary.seasonsUpdated)} updated. ` +
        `Teams set again for ${String(summary.playersUpdated)} imported players. ` +
        `New players (${String(summary.playersCreated.length)}): ${summary.playersCreated.join(', ') || 'none'}. ` +
        `New teams: ${summary.teamsCreated.join(', ') || 'none'}.`,
    )
  }
} finally {
  await payload.destroy()
}
