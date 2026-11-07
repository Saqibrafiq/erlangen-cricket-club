import { LOGIN_PATH } from '@/features/auth'

import type { FixtureEditing } from '../editor-types'
import {
  deleteFixtureAction,
  getFixtureEditorDataAction,
  getFixtureImportDataAction,
  importFixturesAction,
  saveFixtureAction,
} from './actions'

/** What the fixtures page hands to its import controls. */
export const FIXTURE_EDITING: FixtureEditing = {
  actions: {
    getImportData: getFixtureImportDataAction,
    importFixtures: importFixturesAction,
    getFixture: getFixtureEditorDataAction,
    saveFixture: saveFixtureAction,
    deleteFixture: deleteFixtureAction,
  },
  loginHref: LOGIN_PATH,
}
