import { describe, expect, it } from 'vitest'

import {
  fromEditorDocument,
  isEditableOnWebsite,
  isRichTextDocument,
  isRichTextEmpty,
  type RichTextDocument,
  type RichTextNode,
  toEditorDocument,
} from './rich-text'

const ELEMENT = { direction: 'ltr', format: '', indent: 0, version: 1 }

function text(value: string): RichTextNode {
  return { type: 'text', text: value, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }
}

function document(...children: RichTextNode[]): RichTextDocument {
  return { root: { ...ELEMENT, type: 'root', children } }
}

const PAYLOAD_LINK: RichTextNode = {
  ...ELEMENT,
  type: 'link',
  fields: { linkType: 'custom', url: 'https://bcv.example', newTab: true },
  children: [text('BCV')],
}

const EDITOR_LINK: RichTextNode = {
  ...ELEMENT,
  type: 'link',
  url: 'https://bcv.example',
  target: '_blank',
  rel: 'noopener noreferrer',
  title: null,
  children: [text('BCV')],
}

describe('isRichTextDocument', () => {
  it('accepts a Lexical root with children', () => {
    expect(isRichTextDocument(document())).toBe(true)
  })

  it('rejects anything else', () => {
    for (const value of [
      null,
      'text',
      {},
      { root: null },
      { root: { type: 'paragraph', children: [] } },
      { root: { type: 'root' } },
    ]) {
      expect(isRichTextDocument(value)).toBe(false)
    }
  })
})

describe('isEditableOnWebsite', () => {
  it('allows text, headings, quotes, lists and links', () => {
    expect(
      isEditableOnWebsite(
        document(
          { ...ELEMENT, type: 'heading', tag: 'h2', children: [text('Season review')] },
          { ...ELEMENT, type: 'paragraph', children: [text('Read the '), PAYLOAD_LINK] },
          {
            ...ELEMENT,
            type: 'list',
            listType: 'bullet',
            children: [{ ...ELEMENT, type: 'listitem', value: 1, children: [text('9 wins')] }],
          },
          { ...ELEMENT, type: 'quote', children: [text('What a season.')] },
        ),
      ),
    ).toBe(true)
  })

  it('keeps articles with embedded uploads or blocks for the admin', () => {
    expect(isEditableOnWebsite(document({ type: 'upload', relationTo: 'media', value: 4 }))).toBe(
      false,
    )
    expect(
      isEditableOnWebsite(
        document({ ...ELEMENT, type: 'paragraph', children: [{ type: 'inlineBlock' }] }),
      ),
    ).toBe(false)
  })
})

describe('isRichTextEmpty', () => {
  it('sees an empty or blank text as empty', () => {
    expect(isRichTextEmpty(document())).toBe(true)
    expect(
      isRichTextEmpty(document({ ...ELEMENT, type: 'paragraph', children: [text('  ')] })),
    ).toBe(true)
    expect(
      isRichTextEmpty(document({ ...ELEMENT, type: 'paragraph', children: [{ type: 'text' }] })),
    ).toBe(true)
  })

  it('sees any visible character as content', () => {
    expect(
      isRichTextEmpty(document({ ...ELEMENT, type: 'paragraph', children: [text('Hi')] })),
    ).toBe(false)
  })
})

describe('link conversion', () => {
  it('turns Payload links into editor links and back, unchanged', () => {
    const stored = document({
      ...ELEMENT,
      type: 'paragraph',
      children: [text('See '), PAYLOAD_LINK],
    })

    const edited = toEditorDocument(stored)

    expect(edited.root.children?.[0]?.children?.[1]).toEqual(EDITOR_LINK)
    expect(fromEditorDocument(edited)).toEqual(stored)
  })

  it('opens links in the same tab unless asked otherwise', () => {
    const sameTab = { ...PAYLOAD_LINK, fields: { linkType: 'custom', url: '/membership' } }

    const edited = toEditorDocument(document(sameTab))

    expect(edited.root.children?.[0]).toMatchObject({ url: '/membership', target: null, rel: null })
    expect(fromEditorDocument(edited).root.children?.[0]).toMatchObject({
      fields: { linkType: 'custom', url: '/membership', newTab: false },
    })
  })

  it('converts auto-detected links too, and tolerates links without a URL', () => {
    const autolink = { ...ELEMENT, type: 'autolink', children: [text('www.ecc.de')] }

    const edited = toEditorDocument(document(autolink))
    expect(edited.root.children?.[0]).toMatchObject({ type: 'autolink', url: '' })

    const stored = fromEditorDocument(document({ ...autolink, url: 42 }))
    expect(stored.root.children?.[0]).toMatchObject({ fields: { url: '', newTab: false } })
  })

  it('reads link settings stored in an unexpected shape as empty', () => {
    const odd = { ...ELEMENT, type: 'link', fields: 'broken', children: [text('x')] }

    expect(toEditorDocument(document(odd)).root.children?.[0]).toMatchObject({
      url: '',
      target: null,
    })
  })
})
