import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import {
  type InstagramPost,
  mediaResponseSchema,
  refreshResponseSchema,
  shouldRenewToken,
  toPosts,
} from '../domain/feed'

// Instagram API with Instagram Login (graph.instagram.com).
const API = 'https://graph.instagram.com'
const MEDIA_FIELDS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
// Fetch a few more than shown: posts without a picture are skipped.
const FETCH_LIMIT = 12
const POSTS_SHOWN = 6
// Matches the home page's hourly revalidation.
const REVALIDATE_SECONDS = 3600

async function renewToken(payload: Payload, token: string): Promise<string> {
  const url = `${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Instagram token renewal failed with ${String(response.status)}`)
  }
  const { access_token: renewed } = refreshResponseSchema.parse(await response.json())

  await payload.updateGlobal({
    slug: 'instagram',
    data: { accessToken: renewed, tokenRefreshedAt: new Date().toISOString() },
    // The page is being rendered: revalidating it from inside would loop.
    context: { disableRevalidate: true },
  })
  return renewed
}

/**
 * The club's latest Instagram posts (up to six), or none while no token is set. Failures are
 * logged and hide the section: the home page must never break because Instagram is down.
 */
export async function getInstagramPosts(now: Date): Promise<InstagramPost[]> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'instagram' })
  const storedToken = settings.accessToken?.trim()
  if (!storedToken) {
    return []
  }

  try {
    const token = shouldRenewToken(settings.tokenRefreshedAt, now)
      ? await renewToken(payload, storedToken)
      : storedToken
    const url = `${API}/me/media?fields=${MEDIA_FIELDS}&limit=${String(FETCH_LIMIT)}&access_token=${encodeURIComponent(token)}`
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
    if (!response.ok) {
      throw new Error(`Instagram media request failed with ${String(response.status)}`)
    }
    return toPosts(mediaResponseSchema.parse(await response.json()), POSTS_SHOWN)
  } catch (error) {
    payload.logger.error({ err: error }, 'Instagram feed unavailable; hiding it on the home page')
    return []
  }
}
