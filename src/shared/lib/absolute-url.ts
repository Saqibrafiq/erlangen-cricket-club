/** `url` as an absolute URL: media paths like `/api/media/…` are resolved against `siteUrl`. */
export function toAbsoluteUrl(url: string, siteUrl: string): string {
  return /^https?:\/\//.test(url) ? url : `${siteUrl}${url}`
}
