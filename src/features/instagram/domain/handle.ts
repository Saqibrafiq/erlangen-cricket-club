const INSTAGRAM_HOST = 'instagram.com'

/** "@er_cricketclub" from "https://www.instagram.com/er_cricketclub/"; `null` for other links. */
export function getInstagramHandle(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url)
    const [handle] = pathname.split('/').filter(Boolean)
    if (!hostname.endsWith(INSTAGRAM_HOST) || !handle) {
      return null
    }
    return `@${handle}`
  } catch {
    // Not a URL at all: the editor typed something else, so show no handle.
    return null
  }
}
