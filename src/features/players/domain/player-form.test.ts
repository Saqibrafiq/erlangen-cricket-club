import { describe, expect, it } from 'vitest'

import { IMAGE_UPLOAD_MAX_BYTES } from '@/shared/config/image-upload'

import { BIO_MAX_LENGTH, NAME_MAX_LENGTH, parsePlayerForm } from './player-form'

function formData(fields: Record<string, string | string[] | File>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      data.append(key, item)
    }
  }
  return data
}

function photo(type: string, size = 10): File {
  return new File([new Uint8Array(size)], 'photo', { type })
}

const MINIMAL = { name: 'Saqib Rafiq' }

describe('parsePlayerForm', () => {
  it('reads a complete player with teams, flags and a new photo', () => {
    const file = photo('image/webp')
    const result = parsePlayerForm(
      formData({
        id: '7',
        name: '  Saqib Rafiq ',
        playingRole: 'bowler',
        battingStyle: 'right-hand',
        bowlingStyle: 'right-arm-fast',
        clubOffice: 'president',
        teams: ['1', '2'],
        bio: ' Opening bowler. ',
        isFeaturedOnHome: 'on',
        hasPublishConsent: 'on',
        consentNote: 'Membership form, 3 March 2026',
        photo: file,
      }),
    )

    expect(result).toEqual({
      success: true,
      id: 7,
      photo: { kind: 'replace', file },
      player: {
        name: 'Saqib Rafiq',
        playingRole: 'bowler',
        battingStyle: 'right-hand',
        bowlingStyle: 'right-arm-fast',
        clubOffice: 'president',
        teams: [1, 2],
        bio: 'Opening bowler.',
        isFeaturedOnHome: true,
        hasPublishConsent: true,
        consentNote: 'Membership form, 3 March 2026',
      },
    })
  })

  it('treats blank choices, an empty bio and unticked boxes as not set', () => {
    const result = parsePlayerForm(
      formData({ ...MINIMAL, playingRole: '', bowlingStyle: '', bio: '  ', photo: photo('', 0) }),
    )

    expect(result).toEqual({
      success: true,
      id: null,
      photo: { kind: 'keep' },
      player: {
        name: 'Saqib Rafiq',
        playingRole: null,
        battingStyle: null,
        bowlingStyle: null,
        clubOffice: null,
        teams: [],
        bio: null,
        isFeaturedOnHome: false,
        hasPublishConsent: false,
        consentNote: null,
      },
    })
  })

  it('removes the photo when asked, even if a file was chosen too', () => {
    const result = parsePlayerForm(
      formData({ ...MINIMAL, removePhoto: 'on', photo: photo('image/png') }),
    )

    expect(result).toMatchObject({ success: true, photo: { kind: 'remove' } })
  })

  it('requires a name and keeps texts within their limits', () => {
    expect(parsePlayerForm(formData({ name: ' ' }))).toEqual({
      success: false,
      fieldErrors: { name: 'required' },
    })
    expect(
      parsePlayerForm(
        formData({ name: 'x'.repeat(NAME_MAX_LENGTH + 1), bio: 'x'.repeat(BIO_MAX_LENGTH + 1) }),
      ),
    ).toEqual({ success: false, fieldErrors: { name: 'tooLong', bio: 'tooLong' } })
  })

  it('asks how consent was given before a player can be published', () => {
    expect(parsePlayerForm(formData({ ...MINIMAL, hasPublishConsent: 'on' }))).toEqual({
      success: false,
      fieldErrors: { consentNote: 'consentNoteRequired' },
    })
  })

  it('rejects unknown choices, so only real roles and styles are stored', () => {
    expect(parsePlayerForm(formData({ ...MINIMAL, playingRole: 'captain' }))).toMatchObject({
      success: false,
      fieldErrors: { playingRole: 'required' },
    })
  })

  it('accepts only photos of a supported type and size', () => {
    expect(parsePlayerForm(formData({ ...MINIMAL, photo: photo('image/gif') }))).toEqual({
      success: false,
      fieldErrors: { photo: 'photoType' },
    })
    expect(
      parsePlayerForm(
        formData({ ...MINIMAL, photo: photo('image/jpeg', IMAGE_UPLOAD_MAX_BYTES + 1) }),
      ),
    ).toEqual({ success: false, fieldErrors: { photo: 'photoSize' } })
  })

  it('reports field and photo errors together', () => {
    expect(parsePlayerForm(formData({ name: '', photo: photo('application/pdf') }))).toEqual({
      success: false,
      fieldErrors: { name: 'required', photo: 'photoType' },
    })
  })

  it('ignores an id that is not a positive whole number (a new player)', () => {
    for (const id of ['', 'abc', '-3', '1.5']) {
      expect(parsePlayerForm(formData({ ...MINIMAL, id }))).toMatchObject({ id: null })
    }
  })
})
