import { describe, expect, it } from 'vitest'

import { EXCERPT_MAX_LENGTH, parseNewsForm, TITLE_MAX_LENGTH, toDateInputValue } from './news-form'
import type { RichTextDocument } from './rich-text'

const BODY: RichTextDocument = {
  root: {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', text: 'What a season.' }] }],
  },
}

function formData(fields: Record<string, string | string[]>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      data.append(key, item)
    }
  }
  return data
}

const VALID = {
  title: ' Season review 2026 ',
  excerpt: 'Two teams, four competitions.',
  publishedAt: '2026-10-12',
  body: JSON.stringify(BODY),
  status: 'published',
}

describe('parseNewsForm', () => {
  it('reads a complete article', () => {
    const result = parseNewsForm(
      formData({
        ...VALID,
        id: '4',
        featuredImage: '12',
        featuredImageStyle: 'logo',
        gallery: ['13', '14'],
      }),
    )

    expect(result).toEqual({
      success: true,
      id: 4,
      article: {
        title: 'Season review 2026',
        excerpt: 'Two teams, four competitions.',
        publishedAt: '2026-10-12T12:00:00.000Z',
        body: BODY,
        featuredImage: 12,
        featuredImageStyle: 'logo',
        gallery: [13, 14],
        status: 'published',
      },
    })
  })

  it('defaults to a photo without images, and a new article without an id', () => {
    expect(parseNewsForm(formData({ ...VALID, status: 'draft', featuredImage: '' }))).toMatchObject(
      {
        success: true,
        id: null,
        article: { featuredImage: null, featuredImageStyle: 'photo', gallery: [], status: 'draft' },
      },
    )
  })

  it('keeps the stored text when the form sends none (read-only text)', () => {
    const { body: _body, ...withoutBody } = VALID

    expect(parseNewsForm(formData(withoutBody))).toMatchObject({ article: { body: null } })
  })

  it('requires a title, a summary, a valid day and some text', () => {
    expect(
      parseNewsForm(
        formData({ ...VALID, title: '', excerpt: ' ', publishedAt: '12.10.2026', body: '' }),
      ),
    ).toEqual({
      success: false,
      fieldErrors: {
        title: 'required',
        excerpt: 'required',
        publishedAt: 'invalidDate',
        body: 'required',
      },
    })
  })

  it('rejects days that do not exist, and texts that are too long', () => {
    expect(
      parseNewsForm(
        formData({
          ...VALID,
          publishedAt: '2026-13-45',
          title: 'x'.repeat(TITLE_MAX_LENGTH + 1),
          excerpt: 'x'.repeat(EXCERPT_MAX_LENGTH + 1),
        }),
      ),
    ).toEqual({
      success: false,
      fieldErrors: { publishedAt: 'invalidDate', title: 'tooLong', excerpt: 'tooLong' },
    })
  })

  it('accepts only text the website editor can produce', () => {
    const empty = { root: { type: 'root', children: [] } }
    const withUpload = { root: { type: 'root', children: [{ type: 'upload', value: 3 }] } }

    for (const body of [
      'not json',
      JSON.stringify({ hello: 1 }),
      JSON.stringify(empty),
      JSON.stringify(withUpload),
    ]) {
      expect(parseNewsForm(formData({ ...VALID, body }))).toEqual({
        success: false,
        fieldErrors: { body: 'required' },
      })
    }
  })

  it('treats a file in the text field as missing text', () => {
    const data = formData(VALID)
    data.set('body', new Blob(['{}']))

    expect(parseNewsForm(data)).toMatchObject({ fieldErrors: { body: 'required' } })
  })

  it('rejects unknown statuses, image styles and image ids', () => {
    expect(
      parseNewsForm(
        formData({ ...VALID, status: 'archived', featuredImageStyle: 'banner', gallery: ['-1'] }),
      ),
    ).toMatchObject({
      success: false,
      fieldErrors: { status: 'required', featuredImageStyle: 'required', gallery: 'required' },
    })
  })
})

describe('toDateInputValue', () => {
  it('gives the day of a stored date for the date field', () => {
    expect(toDateInputValue('2026-10-12T12:00:00.000Z')).toBe('2026-10-12')
  })
})
