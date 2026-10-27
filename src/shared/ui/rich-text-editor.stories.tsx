import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { RichTextEditor } from './rich-text-editor'

const meta = {
  title: 'Shared/RichTextEditor',
  component: RichTextEditor,
  args: {
    id: 'article-text',
    labelId: 'article-text-label',
    initialValue: null,
    onChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl space-y-1.5 p-6">
        <span id="article-text-label" className="block text-sm font-medium">
          Text
        </span>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RichTextEditor>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

/** An article with a heading, bold text, a link and a list. */
export const WithText: Story = {
  args: {
    initialValue: {
      root: {
        type: 'root',
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h2',
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'text',
                text: 'Match day',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
            ],
          },
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
                text: 'We play at ',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
              {
                type: 'text',
                text: 'home',
                format: 1,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
              {
                type: 'text',
                text: ' against NCC. ',
                format: 0,
                detail: 0,
                mode: 'normal',
                style: '',
                version: 1,
              },
              {
                type: 'link',
                url: 'https://example.com/tickets',
                target: '_blank',
                rel: 'noopener noreferrer',
                title: null,
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
                children: [
                  {
                    type: 'text',
                    text: 'Tickets',
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
          {
            type: 'list',
            listType: 'bullet',
            start: 1,
            tag: 'ul',
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'listitem',
                value: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
                children: [
                  {
                    type: 'text',
                    text: 'Bring your kit',
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
        ],
      },
    },
  },
}

export const Invalid: Story = { args: { 'aria-invalid': true } }
