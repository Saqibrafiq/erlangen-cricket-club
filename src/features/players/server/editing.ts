import { LOGIN_PATH } from '@/features/auth'

import type { PlayerEditing } from '../editor-types'
import {
  deletePlayerAction,
  getHiddenPlayersAction,
  getPlayerEditorDataAction,
  savePlayerAction,
} from './actions'

/** What the squad and profile pages hand to their editing controls. */
export const PLAYER_EDITING: PlayerEditing = {
  actions: {
    getEditorData: getPlayerEditorDataAction,
    getHiddenPlayers: getHiddenPlayersAction,
    savePlayer: savePlayerAction,
    deletePlayer: deletePlayerAction,
  },
  loginHref: LOGIN_PATH,
}
