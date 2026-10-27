import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { isValidLinkUrl, RichTextEditor, type RichTextValue } from './rich-text-editor'

const VALUE: RichTextValue = {
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            text: 'What a season.',
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
      },
    ],
  },
}

function renderEditor(initialValue: RichTextValue | null = VALUE) {
  const onChange = vi.fn()
  renderWithIntl(
    <>
      <span id="text-label">Text</span>
      <RichTextEditor
        id="text"
        labelId="text-label"
        initialValue={initialValue}
        onChange={onChange}
        aria-describedby="text-hint"
      />
      <p id="text-hint">Write the article.</p>
    </>,
  )
  return { onChange }
}

describe('RichTextEditor', () => {
  it('is a labelled, described multi-line text box showing the stored text', async () => {
    renderEditor()

    const textbox = await screen.findByRole('textbox', { name: 'Text' })
    expect(textbox).toHaveAttribute('aria-multiline', 'true')
    expect(textbox).toHaveAccessibleDescription('Write the article.')
    await waitFor(() => {
      expect(textbox).toHaveTextContent('What a season.')
    })
  })

  it('offers its formatting tools in a named toolbar', () => {
    renderEditor(null)

    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' })
    for (const name of [
      'Bold',
      'Italic',
      'Bulleted list',
      'Numbered list',
      'Add link',
      'Undo',
      'Redo',
    ]) {
      expect(toolbar).toContainElement(screen.getByRole('button', { name }))
    }
    expect(screen.getByRole('combobox', { name: 'Text style' })).toHaveValue('paragraph')
  })

  it('asks for a link address and rejects addresses that are not links', async () => {
    renderEditor(null)

    await userEvent.click(screen.getByRole('button', { name: 'Add link' }))
    const address = screen.getByLabelText('Link address')
    await userEvent.clear(address)
    await userEvent.type(address, 'javascript:alert(1){Enter}')

    expect(address).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/starting with https:\/\/ or \//)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByLabelText('Link address')).toBeNull()
  })
})

describe('isValidLinkUrl', () => {
  it('accepts web addresses, pages of this site and email links', () => {
    for (const url of [
      'https://bcv.example/table',
      'http://example.com',
      '/membership',
      ' mailto:info@ecc.de ',
    ]) {
      expect(isValidLinkUrl(url)).toBe(true)
    }
  })

  it('rejects scripts, bare words and addresses with spaces', () => {
    for (const url of [
      'javascript:alert(1)',
      'example.com',
      'https://a b.com',
      'mailto:nobody',
      '',
    ]) {
      expect(isValidLinkUrl(url)).toBe(false)
    }
  })
})
