import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

// The header menu (in the locale layout) lists competitions, so most content affects every
// localised page — not just one route. Revalidating the layout covers all of them; at club
// scale this is cheaper to reason about than per-route tags.
const LOCALIZED_ROOT = '/[locale]'

/** Set `context: { disableRevalidate: true }` when writing outside a Next.js request (seeds, scripts). */
export type RevalidateContext = { disableRevalidate?: boolean }

function revalidateLocalizedPages(req: PayloadRequest): void {
  if ((req.context as RevalidateContext).disableRevalidate) {
    return
  }

  req.payload.logger.info(`Revalidating ${LOCALIZED_ROOT} (layout)`)
  revalidatePath(LOCALIZED_ROOT, 'layout')
}

type AnyDocument = { id: number | string }

export const revalidatePagesAfterChange: CollectionAfterChangeHook<AnyDocument> = ({
  doc,
  req,
}) => {
  revalidateLocalizedPages(req)
  return doc
}

export const revalidatePagesAfterDelete: CollectionAfterDeleteHook<AnyDocument> = ({
  doc,
  req,
}) => {
  revalidateLocalizedPages(req)
  return doc
}

export const revalidatePagesAfterGlobalChange: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateLocalizedPages(req)
  return doc as unknown
}
