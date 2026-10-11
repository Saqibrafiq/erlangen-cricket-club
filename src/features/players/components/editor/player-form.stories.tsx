import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import type { SavePlayerResult } from '../../editor-types'
import { PlayerForm } from './player-form'

function respondWith(result: SavePlayerResult) {
  return () => Promise.resolve(result)
}

const meta = {
  title: 'Players/Editor/PlayerForm',
  component: PlayerForm,
  args: {
    draft: null,
    teams: [
      { id: 1, name: 'Erlangen Cricket Club I' },
      { id: 2, name: 'Erlangen Cricket Club II' },
    ],
    locale: 'en',
    loginHref: '/login',
    save: respondWith({
      status: 'saved',
      player: { id: 9, slug: 'new-player', isPublic: true },
    }),
    onSaved: () => undefined,
    onCancel: () => undefined,
    // Stories never load the model: the chosen photo stands in for its cut-out.
    cutOut: (file: File) => Promise.resolve(file),
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerForm>

export default meta

type Story = StoryObj<typeof meta>

/** Adding a player: everything empty, consent details appear once ticked. */
export const NewPlayer: Story = {}

/** Editing a fast bowler who agreed to be shown. */
export const EditPlayer: Story = {
  args: {
    draft: {
      id: 7,
      name: 'Saqib Rafiq',
      photo: null,
      playingRole: 'bowler',
      battingStyle: 'right-hand',
      bowlingStyle: 'right-arm-fast',
      clubOffice: 'president',
      teams: [1],
      bio: 'Opening bowler and club president.',
      isFeaturedOnHome: true,
      hasPublishConsent: true,
      consentNote: 'Membership form, 3 March 2026',
    },
  },
}

export const DuplicateName: Story = {
  args: { save: respondWith({ status: 'invalid', fieldErrors: { name: 'duplicateName' } }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Name', { exact: true }), 'Saqib Rafiq')
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))
    await expect(await canvas.findByText('A player with this name already exists.')).toBeVisible()
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
