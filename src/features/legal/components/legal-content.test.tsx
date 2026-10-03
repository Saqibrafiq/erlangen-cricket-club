import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import { LegalContent } from './legal-content'

const CONTENT = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
        children: [
          {
            type: 'text',
            text: 'Erlangen Cricket Club e.V.',
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
} as unknown as SerializedEditorState

describe('LegalContent', () => {
  it('renders the editor content', () => {
    renderWithIntl(<LegalContent content={CONTENT} />)

    expect(screen.getByText('Erlangen Cricket Club e.V.')).toBeInTheDocument()
  })

  it('shows a notice while the content has not been written', () => {
    renderWithIntl(<LegalContent content={null} />, { locale: 'de' })

    expect(screen.getByText(/wird gerade vorbereitet/)).toBeInTheDocument()
  })
})
