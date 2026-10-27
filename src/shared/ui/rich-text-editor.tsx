'use client'

import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { $createHeadingNode, $isHeadingNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $findMatchingParent } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  type EditorThemeClasses,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { Bold, Italic, Link2, Link2Off, List, ListOrdered, Redo2, Undo2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ReactNode, useEffect, useId, useState } from 'react'

import { cn } from '@/shared/lib/cn'

import { Button } from './button'
import { formControlClassName } from './form-field'

/** Lexical's serialized editor state: `{ root: { type: 'root', children: [...] } }`. */
export type RichTextValue = {
  root: { type: string; children?: unknown[] } & Record<string, unknown>
}

export type RichTextEditorProps = {
  id: string
  /** Text as stored, or `null` to start empty. */
  initialValue: RichTextValue | null
  onChange: (value: RichTextValue) => void
  /** Accessible wiring from `FormField`. */
  'aria-describedby'?: string
  'aria-invalid'?: true
  /** The visible label's id (the editable area is not a native control, so `htmlFor` can't link it). */
  labelId: string
}

type BlockType = 'paragraph' | 'h2' | 'h3' | 'bullet' | 'number'

const THEME: EditorThemeClasses = {
  paragraph: 'mb-3 last:mb-0',
  heading: {
    h2: 'mb-2 mt-4 font-display text-2xl font-bold first:mt-0',
    h3: 'mb-2 mt-3 text-lg font-bold first:mt-0',
  },
  list: {
    ul: 'mb-3 list-disc pl-6',
    ol: 'mb-3 list-decimal pl-6',
    listitem: 'my-1',
  },
  quote: 'mb-3 border-l-4 border-brand-primary/40 pl-4 italic',
  link: 'text-brand-primary underline underline-offset-4',
  text: { bold: 'font-bold', italic: 'italic' },
}

const NODES = [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode]

/** Web addresses, site paths ("/membership") and email links; nothing that could run script. */
const LINK_PATTERN = /^(https?:\/\/[^\s]+|\/[^\s]*|mailto:[^\s@]+@[^\s@]+)$/

/** Whether a link address is safe and sensible to store. */
export function isValidLinkUrl(url: string): boolean {
  return LINK_PATTERN.test(url.trim())
}

const TOOL_CLASS =
  'inline-flex size-9 items-center justify-center rounded-md text-text-default transition-colors duration-150 hover:bg-surface-muted disabled:opacity-40 aria-pressed:bg-brand-primary aria-pressed:text-brand-on-primary [&_svg]:size-4'

function ToolButton({
  label,
  isPressed,
  disabled,
  onClick,
  children,
}: {
  label: string
  isPressed?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={isPressed}
      disabled={disabled}
      // Keep the text selection: a button press would otherwise move focus out of the text.
      onMouseDown={(event) => {
        event.preventDefault()
      }}
      onClick={onClick}
      className={TOOL_CLASS}
    >
      {children}
    </button>
  )
}

function useSelectionFormat() {
  const [editor] = useLexicalComposerContext()
  const [format, setFormat] = useState({
    blockType: 'paragraph' as BlockType,
    isBold: false,
    isItalic: false,
    isLink: false,
  })

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return
          }
          const anchor = selection.anchor.getNode()
          const block = anchor.getKey() === 'root' ? anchor : anchor.getTopLevelElementOrThrow()
          const list = $findMatchingParent(anchor, $isListNode)
          let blockType: BlockType = 'paragraph'
          if (list) {
            blockType = list.getListType() === 'number' ? 'number' : 'bullet'
          } else if ($isHeadingNode(block)) {
            blockType = block.getTag() === 'h3' ? 'h3' : 'h2'
          }
          setFormat({
            blockType,
            isBold: selection.hasFormat('bold'),
            isItalic: selection.hasFormat('italic'),
            isLink: $findMatchingParent(anchor, $isLinkNode) !== null,
          })
        })
      }),
    [editor],
  )

  return format
}

function LinkForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations('richTextEditor')
  const [editor] = useLexicalComposerContext()
  const id = useId()
  const [url, setUrl] = useState('https://')
  const [isInvalid, setIsInvalid] = useState(false)

  function apply() {
    const address = url.trim()
    if (!isValidLinkUrl(address)) {
      setIsInvalid(true)
      return
    }
    // Other websites open in a new tab; pages of this site in the same one.
    const isExternal = !address.startsWith('/')
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
      url: address,
      target: isExternal ? '_blank' : null,
      rel: isExternal ? 'noopener noreferrer' : null,
    })
    // Continue after the link: a selection left behind would be replaced by the next keystroke.
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const end = selection.isBackward() ? selection.anchor : selection.focus
        selection.anchor.set(end.key, end.offset, end.type)
        selection.focus.set(end.key, end.offset, end.type)
      }
    })
    onDone()
    editor.focus()
  }

  return (
    <div className="flex flex-wrap items-end gap-2 border-b border-border-default p-2">
      <div className="min-w-48 flex-1 space-y-1">
        <label htmlFor={`${id}-url`} className="block text-sm font-medium">
          {t('linkUrl')}
        </label>
        <input
          id={`${id}-url`}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- opened on request to type an address
          autoFocus
          value={url}
          aria-invalid={isInvalid || undefined}
          aria-describedby={`${id}-hint`}
          onChange={(event) => {
            setUrl(event.target.value)
            setIsInvalid(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              apply()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              onDone()
              editor.focus()
            }
          }}
          className={cn(formControlClassName, 'py-1.5')}
        />
        <p
          id={`${id}-hint`}
          className={cn('text-xs', isInvalid ? 'text-status-danger-text' : 'text-text-muted')}
        >
          {isInvalid ? t('invalidUrl') : t('linkHint')}
        </p>
      </div>
      <Button type="button" size="sm" onClick={apply}>
        {t('addLink')}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => {
          onDone()
          editor.focus()
        }}
      >
        {t('cancel')}
      </Button>
    </div>
  )
}

function Toolbar() {
  const t = useTranslations('richTextEditor')
  const [editor] = useLexicalComposerContext()
  const { blockType, isBold, isItalic, isLink } = useSelectionFormat()
  const [isAddingLink, setIsAddingLink] = useState(false)

  function setBlock(next: BlockType) {
    if (next === 'bullet') {
      editor.dispatchCommand(
        blockType === 'bullet' ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND,
        undefined,
      )
      return
    }
    if (next === 'number') {
      editor.dispatchCommand(
        blockType === 'number' ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND,
        undefined,
      )
      return
    }
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () =>
          next === 'paragraph' ? $createParagraphNode() : $createHeadingNode(next),
        )
      }
    })
  }

  return (
    <>
      <div
        role="toolbar"
        aria-label={t('toolbar')}
        className="flex flex-wrap items-center gap-1 border-b border-border-default p-1.5"
      >
        <select
          aria-label={t('textStyle')}
          value={blockType === 'bullet' || blockType === 'number' ? 'paragraph' : blockType}
          onChange={(event) => {
            const value = event.target.value
            setBlock(value === 'h2' || value === 'h3' ? value : 'paragraph')
          }}
          className="h-9 rounded-md border border-border-default bg-surface-default px-2 text-sm"
        >
          <option value="paragraph">{t('paragraph')}</option>
          <option value="h2">{t('heading')}</option>
          <option value="h3">{t('subheading')}</option>
        </select>
        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border-default" />
        <ToolButton
          label={t('bold')}
          isPressed={isBold}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
          }}
        >
          <Bold aria-hidden="true" />
        </ToolButton>
        <ToolButton
          label={t('italic')}
          isPressed={isItalic}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
          }}
        >
          <Italic aria-hidden="true" />
        </ToolButton>
        <ToolButton
          label={t('bulletList')}
          isPressed={blockType === 'bullet'}
          onClick={() => {
            setBlock('bullet')
          }}
        >
          <List aria-hidden="true" />
        </ToolButton>
        <ToolButton
          label={t('numberedList')}
          isPressed={blockType === 'number'}
          onClick={() => {
            setBlock('number')
          }}
        >
          <ListOrdered aria-hidden="true" />
        </ToolButton>
        <ToolButton
          label={isLink ? t('removeLink') : t('link')}
          isPressed={isLink}
          onClick={() => {
            if (isLink) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
            } else {
              setIsAddingLink(true)
            }
          }}
        >
          {isLink ? <Link2Off aria-hidden="true" /> : <Link2 aria-hidden="true" />}
        </ToolButton>
        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border-default" />
        <ToolButton
          label={t('undo')}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined)
          }}
        >
          <Undo2 aria-hidden="true" />
        </ToolButton>
        <ToolButton
          label={t('redo')}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined)
          }}
        >
          <Redo2 aria-hidden="true" />
        </ToolButton>
      </div>
      {isAddingLink && (
        <LinkForm
          onDone={() => {
            setIsAddingLink(false)
          }}
        />
      )}
    </>
  )
}

/**
 * A visual text editor (headings, bold, italic, lists, links) built on Lexical, the engine
 * Payload's admin uses, so its JSON is what Payload stores. Keyboard shortcuts (Ctrl+B, Ctrl+I,
 * Ctrl+Z) work as in any word processor.
 */
export function RichTextEditor({
  id,
  initialValue,
  onChange,
  labelId,
  'aria-describedby': describedBy,
  'aria-invalid': isInvalid,
}: RichTextEditorProps) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: id,
        theme: THEME,
        nodes: NODES,
        editorState: initialValue ? JSON.stringify(initialValue) : undefined,
        onError: (error) => {
          // Surfacing beats silently losing an article's text; the form's error boundary catches it.
          throw error
        },
      }}
    >
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-border-default bg-surface-default focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
          isInvalid && 'border-status-danger-text',
        )}
      >
        <Toolbar />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              id={id}
              aria-labelledby={labelId}
              aria-describedby={describedBy}
              aria-invalid={isInvalid}
              aria-multiline
              className="min-h-48 px-3 py-2.5 text-base outline-none"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin validateUrl={isValidLinkUrl} />
      <OnChangePlugin
        ignoreSelectionChange
        onChange={(editorState) => {
          onChange(editorState.toJSON())
        }}
      />
    </LexicalComposer>
  )
}
