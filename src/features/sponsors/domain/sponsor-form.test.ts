import { describe, expect, it } from 'vitest'

import { IMAGE_UPLOAD_MAX_BYTES } from '@/shared/config/image-upload'

import { DESCRIPTION_MAX_LENGTH, parseSponsorForm } from './sponsor-form'

const LOGO = new File([new Uint8Array(8)], 'logo.png', { type: 'image/png' })

function formData(fields: Record<string, string | File>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value)
  }
  return data
}

const VALID = {
  name: '  mein-banker ',
  tier: 'title',
  since: '2024',
  descriptionEn: 'Our title sponsor.',
  descriptionDe: 'Unser Hauptsponsor.',
  website: 'https://mein-banker.de',
  isActive: 'on',
}

describe('parseSponsorForm', () => {
  it('accepts a new sponsor with a logo and trims the text', () => {
    const result = parseSponsorForm(formData({ ...VALID, logo: LOGO }))

    expect(result).toEqual({
      success: true,
      id: null,
      logo: { kind: 'replace', file: expect.any(File) as File },
      sponsor: {
        name: 'mein-banker',
        tier: 'title',
        since: 2024,
        descriptionEn: 'Our title sponsor.',
        descriptionDe: 'Unser Hauptsponsor.',
        website: 'https://mein-banker.de',
        isActive: true,
      },
    })
  })

  it('keeps the logo of an existing sponsor and treats a blank website as none', () => {
    const result = parseSponsorForm(formData({ ...VALID, id: '4', website: ' ', isActive: '' }))

    expect(result).toMatchObject({
      success: true,
      id: 4,
      logo: { kind: 'keep' },
      sponsor: { website: null, isActive: false },
    })
  })

  it('requires a logo for a new sponsor', () => {
    expect(parseSponsorForm(formData(VALID))).toEqual({
      success: false,
      fieldErrors: { logo: 'logoRequired' },
    })
  })

  it('rejects logos of the wrong type or size', () => {
    const gif = new File([new Uint8Array(8)], 'logo.gif', { type: 'image/gif' })
    const huge = new File([new Uint8Array(IMAGE_UPLOAD_MAX_BYTES + 1)], 'logo.png', {
      type: 'image/png',
    })

    expect(parseSponsorForm(formData({ ...VALID, logo: gif }))).toMatchObject({
      fieldErrors: { logo: 'logoType' },
    })
    expect(parseSponsorForm(formData({ ...VALID, logo: huge }))).toMatchObject({
      fieldErrors: { logo: 'logoSize' },
    })
  })

  it('reports every invalid field with a code the form translates', () => {
    const result = parseSponsorForm(
      formData({
        id: '4',
        name: '',
        tier: 'gold',
        since: '1999',
        descriptionEn: 'x'.repeat(DESCRIPTION_MAX_LENGTH + 1),
        descriptionDe: '',
        website: 'http://insecure.example',
      }),
    )

    expect(result).toEqual({
      success: false,
      fieldErrors: {
        name: 'required',
        tier: 'required',
        since: 'year',
        descriptionEn: 'tooLong',
        descriptionDe: 'required',
        website: 'website',
      },
    })
  })

  it('treats a missing year as invalid, not as zero', () => {
    expect(parseSponsorForm(formData({ ...VALID, id: '4', since: '' }))).toMatchObject({
      fieldErrors: { since: 'year' },
    })
  })
})
