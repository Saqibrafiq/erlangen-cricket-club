/** Past this, the header bar becomes the floating pill. */
export const FLOAT_AFTER_PX = 24

/** Whether the header floats as the compact pill: once the page has scrolled past the top. */
export function isHeaderFloating(y: number): boolean {
  return y > FLOAT_AFTER_PX
}
