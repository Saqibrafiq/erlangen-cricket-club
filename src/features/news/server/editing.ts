import { LOGIN_PATH } from '@/features/auth'

import type { NewsEditing } from '../editor-types'
import {
  deleteNewsAction,
  getDraftNewsAction,
  getNewsArticleForEditingAction,
  saveNewsAction,
  uploadNewsImageAction,
} from './actions'

/** What the news list and article pages hand to their editing controls. */
export const NEWS_EDITING: NewsEditing = {
  actions: {
    getArticle: getNewsArticleForEditingAction,
    getDrafts: getDraftNewsAction,
    uploadImage: uploadNewsImageAction,
    saveArticle: saveNewsAction,
    deleteArticle: deleteNewsAction,
  },
  loginHref: LOGIN_PATH,
}
