import { renderGraphic } from '@/features/instagram'
import { parseGraphicFile } from '@/shared/lib/instagram-graphic'
import { routing } from '@/i18n/routing'

/**
 * Instagram post graphics, e.g. /instagram/en/result-42.png. Editors download them from the admin
 * (fixtures and players) and post them on the club's Instagram.
 */
export async function GET(
  request: Request,
  { params }: RouteContext<'/instagram/[locale]/[file]'>,
) {
  const { locale: localeParam, file } = await params
  const locale = routing.locales.find((candidate) => candidate === localeParam)
  const graphic = parseGraphicFile(file)

  const image = locale && graphic ? await renderGraphic(graphic, locale, request.url) : null
  if (!image) {
    return new Response('Not found', { status: 404 })
  }

  // Always fresh: editors download right after entering a result or changing a player.
  image.headers.set('Cache-Control', 'no-store')
  return image
}
