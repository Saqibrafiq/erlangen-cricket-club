import { LOGIN_PATH } from '@/features/auth'

import type { StandingsEditing } from '../editor-types'
import { getStandingsImportDataAction, importStandingsAction } from './actions'

/** What the standings page hands to its import controls. */
export const STANDINGS_EDITING: StandingsEditing = {
  actions: {
    getImportData: getStandingsImportDataAction,
    importStandings: importStandingsAction,
  },
  loginHref: LOGIN_PATH,
}
