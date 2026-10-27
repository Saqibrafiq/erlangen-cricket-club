import { LOGIN_PATH } from '@/features/auth'

import type { SponsorEditing } from '../editor-types'
import {
  deleteSponsorAction,
  getInactiveSponsorsAction,
  getSponsorAction,
  saveSponsorAction,
} from './actions'

/** What the sponsors page hands to its editing controls. */
export const SPONSOR_EDITING: SponsorEditing = {
  actions: {
    getSponsor: getSponsorAction,
    getInactiveSponsors: getInactiveSponsorsAction,
    saveSponsor: saveSponsorAction,
    deleteSponsor: deleteSponsorAction,
  },
  loginHref: LOGIN_PATH,
}
