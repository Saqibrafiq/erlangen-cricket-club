import { z } from 'zod'

const MS_PER_DAY = 86_400_000
// Instagram renews a token only when it is at least a day old; weekly keeps well within 60 days.
const RENEW_AFTER_DAYS = 7

const mediaSchema = z.object({
  id: z.string(),
  caption: z.string().optional(),
  media_type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']),
  media_url: z.url().optional(),
  thumbnail_url: z.url().optional(),
  permalink: z.url(),
  timestamp: z.string(),
})

/** Instagram API response for `/me/media`, validated: external input (CLAUDE.md §3). */
export const mediaResponseSchema = z.object({ data: z.array(mediaSchema) })

export const refreshResponseSchema = z.object({ access_token: z.string().min(1) })

export type InstagramPost = {
  id: string
  /** Square-cropped on the page; for videos, the thumbnail. */
  imageUrl: string
  caption: string | null
  permalink: string
  isVideo: boolean
  /** ISO date-time */
  postedAt: string
}

/** Posts with a picture to show, newest first as delivered, at most `limit`. */
export function toPosts(
  response: z.infer<typeof mediaResponseSchema>,
  limit: number,
): InstagramPost[] {
  return response.data
    .flatMap((media) => {
      const isVideo = media.media_type === 'VIDEO'
      const imageUrl = isVideo ? media.thumbnail_url : media.media_url
      if (!imageUrl) {
        return []
      }
      return [
        {
          id: media.id,
          imageUrl,
          caption: media.caption?.trim() ?? null,
          permalink: media.permalink,
          isVideo,
          postedAt: media.timestamp,
        },
      ]
    })
    .slice(0, limit)
}

/** Whether the token should be renewed now (never renewed, or a week ago or more). */
export function shouldRenewToken(refreshedAt: string | null | undefined, now: Date): boolean {
  if (!refreshedAt) {
    return true
  }
  return now.getTime() - new Date(refreshedAt).getTime() >= RENEW_AFTER_DAYS * MS_PER_DAY
}
