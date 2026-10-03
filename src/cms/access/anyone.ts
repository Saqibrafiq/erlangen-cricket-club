import type { Access } from 'payload'

/** Public read access, for content shown on the public website. */
export const anyone: Access = () => true
