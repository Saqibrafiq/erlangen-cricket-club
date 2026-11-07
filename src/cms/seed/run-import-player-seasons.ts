import { getPayload } from 'payload'

import config from '../../payload.config'
import { importPlayerSeasons } from './import-player-seasons'

// Entry point for `pnpm db:import:player-seasons` (runs via `payload run`).
const payload = await getPayload({ config })

try {
  const summary = await importPlayerSeasons(payload)
  payload.logger.info(
    `Player seasons: ${String(summary.seasonsCreated)} created, ${String(summary.seasonsUpdated)} updated. ` +
      `Teams set again for ${String(summary.playersUpdated)} imported players. ` +
      `New players (${String(summary.playersCreated.length)}): ${summary.playersCreated.join(', ') || 'none'}. ` +
      `New teams: ${summary.teamsCreated.join(', ') || 'none'}.`,
  )
} finally {
  await payload.destroy()
}
