/*
 * Article text in two shapes: as Payload stores it (and its admin and renderer read it) and as the
 * website's Lexical editor works with it. Both are Lexical JSON; only links differ: Payload keeps
 * `fields: { url, newTab, linkType }`, the editor's LinkNode uses `url`, `target` and `rel`.
 */

/** A Lexical node: its type, children for element nodes, and type-specific properties. */
export type RichTextNode = {
  type: string
  children?: RichTextNode[]
  [property: string]: unknown
}

export type RichTextDocument = { root: RichTextNode }

/** Node types the website editor understands; anything else stays editable in the admin only. */
const EDITABLE_TYPES = new Set([
  'root',
  'paragraph',
  'heading',
  'quote',
  'list',
  'listitem',
  'text',
  'linebreak',
  'tab',
  'link',
  'autolink',
])
const LINK_TYPES = new Set(['link', 'autolink'])
const NEW_TAB = '_blank'
const NEW_TAB_REL = 'noopener noreferrer'

function isNode(value: unknown): value is RichTextNode {
  return (
    typeof value === 'object' && value !== null && typeof Reflect.get(value, 'type') === 'string'
  )
}

/** Whether `value` is a rich-text document (a Lexical root with children). */
export function isRichTextDocument(value: unknown): value is RichTextDocument {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const root: unknown = Reflect.get(value, 'root')
  return isNode(root) && root.type === 'root' && Array.isArray(root.children)
}

function everyNode(node: RichTextNode, test: (node: RichTextNode) => boolean): boolean {
  return test(node) && (node.children ?? []).every((child) => everyNode(child, test))
}

/**
 * True when every node can be edited on the website. Articles with embedded uploads, blocks and
 * the like keep their text read-only there, so saving can never drop content the editor can't show.
 */
export function isEditableOnWebsite(document: RichTextDocument): boolean {
  return everyNode(document.root, (node) => EDITABLE_TYPES.has(node.type))
}

/** True when the text has no visible characters, e.g. a fresh article. */
export function isRichTextEmpty(document: RichTextDocument): boolean {
  return everyNode(document.root, (node) => {
    const text: unknown = Reflect.get(node, 'text')
    return node.type !== 'text' || typeof text !== 'string' || text.trim() === ''
  })
}

function mapNodes(node: RichTextNode, map: (node: RichTextNode) => RichTextNode): RichTextNode {
  const mapped = map(node)
  return mapped.children
    ? { ...mapped, children: mapped.children.map((child) => mapNodes(child, map)) }
    : mapped
}

function readFields(node: RichTextNode): { url: string; newTab: boolean } {
  const fields: unknown = node.fields
  if (typeof fields !== 'object' || fields === null) {
    return { url: '', newTab: false }
  }
  const url: unknown = Reflect.get(fields, 'url')
  const newTab: unknown = Reflect.get(fields, 'newTab')
  return { url: typeof url === 'string' ? url : '', newTab: newTab === true }
}

/** Payload's stored text → the website editor's initial state. */
export function toEditorDocument(document: RichTextDocument): RichTextDocument {
  return {
    root: mapNodes(document.root, (node) => {
      if (!LINK_TYPES.has(node.type)) {
        return node
      }
      const { fields: _fields, ...rest } = node
      const { url, newTab } = readFields(node)
      return {
        ...rest,
        url,
        target: newTab ? NEW_TAB : null,
        rel: newTab ? NEW_TAB_REL : null,
        title: null,
      }
    }),
  }
}

/** The website editor's state → the shape Payload stores, renders and edits in its admin. */
export function fromEditorDocument(document: RichTextDocument): RichTextDocument {
  return {
    root: mapNodes(document.root, (node) => {
      if (!LINK_TYPES.has(node.type)) {
        return node
      }
      const { url, target, rel: _rel, title: _title, ...rest } = node
      return {
        ...rest,
        fields: {
          linkType: 'custom',
          url: typeof url === 'string' ? url : '',
          newTab: target === NEW_TAB,
        },
      }
    }),
  }
}
