export const NEWS_PATH = '/news'

/** Unlocalised path of an article, e.g. "/news/annual-general-meeting-2024-key-takeaways". */
export function getNewsPath(slug: string): string {
  return `${NEWS_PATH}/${slug}`
}
