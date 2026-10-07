import type {
  SerializedHeadingNode,
  SerializedLinkNode,
  SerializedListItemNode,
  SerializedListNode,
  SerializedParagraphNode,
  SerializedTextNode,
} from '@payloadcms/richtext-lexical'

import type { News } from '../../payload-types'

/** Inline content: plain text, or a link opening in a new tab. */
export type SeedInline = string | { text: string; href: string }

/** A compact way to write seed articles; converted to Payload's Lexical JSON by `toRichText`. */
export type SeedBlock = { heading: string } | { paragraph: SeedInline[] } | { list: string[] }

const ELEMENT_DEFAULTS = { direction: 'ltr', format: '', indent: 0, version: 1 } as const

function textNode(text: string): SerializedTextNode {
  return { type: 'text', text, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }
}

type InlineNode = SerializedTextNode | SerializedLinkNode<SerializedTextNode>

function inlineNode(inline: SeedInline): InlineNode {
  if (typeof inline === 'string') {
    return textNode(inline)
  }

  return {
    ...ELEMENT_DEFAULTS,
    type: 'link',
    fields: { linkType: 'custom', url: inline.href, newTab: true },
    children: [textNode(inline.text)],
  }
}

function paragraphNode(children: SeedInline[]): SerializedParagraphNode<InlineNode> {
  return {
    ...ELEMENT_DEFAULTS,
    type: 'paragraph',
    textFormat: 0,
    textStyle: '',
    children: children.map(inlineNode),
  }
}

function headingNode(text: string): SerializedHeadingNode<SerializedTextNode> {
  return { ...ELEMENT_DEFAULTS, type: 'heading', tag: 'h2', children: [textNode(text)] }
}

function listNode(items: string[]): SerializedListNode<SerializedListItemNode<SerializedTextNode>> {
  return {
    ...ELEMENT_DEFAULTS,
    type: 'list',
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    children: items.map((item, index): SerializedListItemNode<SerializedTextNode> => ({
      ...ELEMENT_DEFAULTS,
      type: 'listitem',
      value: index + 1,
      checked: undefined,
      children: [textNode(item)],
    })),
  }
}

/** Builds the rich-text value of a seed article. */
export function toRichText(blocks: readonly SeedBlock[]): News['body'] {
  return {
    root: {
      ...ELEMENT_DEFAULTS,
      type: 'root',
      children: blocks.map((block) => {
        if ('heading' in block) return headingNode(block.heading)
        if ('list' in block) return listNode(block.list)
        return paragraphNode(block.paragraph)
      }),
    },
  }
}
