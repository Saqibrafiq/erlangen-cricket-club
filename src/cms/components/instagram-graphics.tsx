'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

import { getGraphicPath, type GraphicRequest } from '../../shared/lib/instagram-graphic'

// The admin is English only (TD-6); graphics come in both site languages.
const LANGUAGES = [
  { locale: 'en', label: 'English' },
  { locale: 'de', label: 'Deutsch' },
] as const

type Graphic = {
  title: string
  request: GraphicRequest
}

function useGraphics(): Graphic[] | null {
  const { id, collectionSlug } = useDocumentInfo()
  const status = useFormFields(([fields]) => fields.status?.value)
  const slug = useFormFields(([fields]) => fields.slug?.value)
  const hasConsent = useFormFields(([fields]) => fields.hasPublishConsent?.value)

  if (id === undefined) {
    return null
  }

  if (collectionSlug === 'players') {
    return hasConsent === true && typeof slug === 'string'
      ? [{ title: 'Player card', request: { kind: 'player', slug } }]
      : []
  }

  const fixtureId = Number(id)
  if (status === 'scheduled') {
    return [{ title: 'Matchday announcement', request: { kind: 'match', fixtureId } }]
  }
  return status === 'completed' ? [{ title: 'Result', request: { kind: 'result', fixtureId } }] : []
}

/**
 * "Instagram post" box in the fixture and player edit views: download links for ready-made
 * 1080×1350 graphics, generated from the saved data.
 */
export function InstagramGraphics() {
  const graphics = useGraphics()
  const { collectionSlug } = useDocumentInfo()

  return (
    <div className="field-type" style={{ marginBottom: 'var(--base)' }}>
      <p className="field-label">Instagram post</p>
      {graphics === null && <p>Save first, then download ready-made images for Instagram.</p>}
      {graphics?.length === 0 && (
        <p>
          {collectionSlug === 'players'
            ? 'Available once the player has agreed to appear on the website (and is saved).'
            : 'Available for scheduled and completed fixtures.'}
        </p>
      )}
      {graphics && graphics.length > 0 && (
        <ul
          style={{ display: 'grid', gap: 'calc(var(--base) / 2)', padding: 0, listStyle: 'none' }}
        >
          {graphics.map(({ title, request }) => (
            <li key={title}>
              <strong>{title}:</strong>{' '}
              {LANGUAGES.map(({ locale, label }, index) => (
                <span key={locale}>
                  {index > 0 && ' · '}
                  <a href={getGraphicPath(locale, request)} download target="_blank" rel="noopener">
                    {label}
                  </a>
                </span>
              ))}
            </li>
          ))}
        </ul>
      )}
      <p style={{ opacity: 0.7 }}>Uses the last saved version: save your changes first.</p>
    </div>
  )
}
