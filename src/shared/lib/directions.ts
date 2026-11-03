/** Google Maps directions to a ground given by name or address (no tracking embed, just a link). */
export function getDirectionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}
