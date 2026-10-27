import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import type { SaveSponsorResult } from '../../editor-types'
import { TITLE_SPONSOR } from '../../test-factories'
import { SponsorForm } from './sponsor-form'

function respondWith(result: SaveSponsorResult) {
  return () => Promise.resolve(result)
}

const meta = {
  title: 'Sponsors/Editor/SponsorForm',
  component: SponsorForm,
  args: {
    draft: null,
    locale: 'en',
    loginHref: '/login',
    save: respondWith({ status: 'saved', sponsor: { id: 12, isActive: true } }),
    onSaved: () => undefined,
    onCancel: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SponsorForm>

export default meta

type Story = StoryObj<typeof meta>

/** Adding a sponsor: the preview fills in as the editor types. */
export const NewSponsor: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Name'), 'Bäckerei Erlangen')
    await expect(
      canvas.getByRole('heading', { level: 3, hidden: true, name: 'Bäckerei Erlangen' }),
    ).toBeInTheDocument()
  },
}

/** Editing the title sponsor. */
export const EditSponsor: Story = {
  args: {
    draft: {
      id: TITLE_SPONSOR.id,
      name: TITLE_SPONSOR.name,
      logo: TITLE_SPONSOR.logo,
      tier: 'title',
      since: TITLE_SPONSOR.since,
      descriptionEn: TITLE_SPONSOR.description,
      descriptionDe: 'mein-banker bietet persönliche Finanzberatung.',
      website: TITLE_SPONSOR.website,
      isActive: true,
    },
  },
}

export const InvalidFields: Story = {
  args: {
    save: respondWith({
      status: 'invalid',
      fieldErrors: { name: 'required', logo: 'logoRequired', website: 'website' },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(await canvas.findByText('Please choose a logo.')).toBeVisible()
  },
}

export const SessionEnded: Story = {
  args: { save: respondWith({ status: 'unauthorized' }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(await canvas.findByRole('link', { name: 'Sign in again' })).toBeVisible()
  },
}

export const Saving: Story = { args: { isFinishing: true } }
