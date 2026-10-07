import type { Document, Media, Membership } from '@/payload-types'

import type { DownloadableDocument, MembershipImage, MembershipInfo } from '../types'

function mapDocument(document: number | Document | null | undefined): DownloadableDocument | null {
  if (typeof document !== 'object' || !document?.url) {
    return null
  }

  return { title: document.title, url: document.url }
}

function mapImage(media: number | Media | null | undefined): MembershipImage | null {
  if (typeof media !== 'object' || !media?.url || !media.width || !media.height) {
    return null
  }

  return { url: media.url, alt: media.alt, width: media.width, height: media.height }
}

/** One checklist item per non-empty line. */
function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Maps the membership global (queried with depth >= 1) to the page's view model. */
export function mapMembership(global: Partial<Membership>): MembershipInfo {
  return {
    heroImage: mapImage(global.heroImage),
    fees: (global.fees ?? []).map((fee) => ({
      name: fee.name,
      includes: toLines(fee.includes),
      annualFee: fee.annualFee,
      reducedFee: fee.reducedFee ?? null,
      perMatchFee: fee.perMatchFee ?? null,
      isHighlighted: fee.isHighlighted ?? false,
    })),
    feesNote: global.feesNote ?? null,
    terms: global.terms ?? null,
    applicationForm: mapDocument(global.applicationForm),
    sessions: (global.sessions ?? []).map((session) => ({
      title: session.title,
      days: session.days,
      startTime: session.startTime,
      endTime: session.endTime,
      venue: session.venue,
    })),
    sessionsNote: global.sessionsNote ?? null,
  }
}
