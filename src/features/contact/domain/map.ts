export type Coordinates = {
  latitude: number
  longitude: number
}

// Half the visible map's height and width in degrees: about 600 m × 900 m around the ground,
// enough to see the nearest streets and the station path.
const LATITUDE_SPAN = 0.003
const LONGITUDE_SPAN = 0.006
const OSM_ZOOM = 17

/** OpenStreetMap's embeddable map around `point`, with a marker on it. */
export function buildMapEmbedUrl({ latitude, longitude }: Coordinates): string {
  const bbox = [
    longitude - LONGITUDE_SPAN,
    latitude - LATITUDE_SPAN,
    longitude + LONGITUDE_SPAN,
    latitude + LATITUDE_SPAN,
  ].join(',')
  const params = new URLSearchParams({
    bbox,
    layer: 'mapnik',
    marker: `${latitude},${longitude}`,
  })
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`
}

/** The same place on openstreetmap.org, for a larger interactive map. */
export function buildLargerMapUrl({ latitude, longitude }: Coordinates): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${OSM_ZOOM}/${latitude}/${longitude}`
}

/** Google Maps search for the point: opens the maps app on phones, e.g. for directions. */
export function buildDirectionsUrl({ latitude, longitude }: Coordinates): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
}
