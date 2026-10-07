import type { Validate } from 'payload'

/** A site path ("/news/…") or a full web address; empty passes. */
export const validateLink: Validate<string | null | undefined> = (value) =>
  !value ||
  value.startsWith('/') ||
  /^https?:\/\//.test(value) ||
  'Use a site path such as "/news/my-article" or a full address starting with https://.'
