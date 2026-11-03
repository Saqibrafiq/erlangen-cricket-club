import { LOGIN_PATH } from '@/features/auth'

import type { FixtureEditing } from '../editor-types'
import { getFixtureImportDataAction, importFixturesAction } from './actions'

/** What the fixtures page hands to its import controls. */
export const FIXTURE_EDITING: FixtureEditing = {
  actions: {
    getImportData: getFixtureImportDataAction,
    importFixtures: importFixturesAction,
  },
  loginHref: LOGIN_PATH,
}
