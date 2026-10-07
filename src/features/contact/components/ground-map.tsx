'use client'

import { ExternalLink, Map as MapIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/shared/ui/button'

import { buildLargerMapUrl, buildMapEmbedUrl, type Coordinates } from '../domain/map'

export type GroundMapProps = {
  coordinates: Coordinates
  /** Names the map for assistive technology, e.g. the ground's name. */
  placeName: string
}

/**
 * Interactive OpenStreetMap, loaded only on request: until then, no data reaches a third party
 * (two-click solution, no consent banner needed — see ADR-0008).
 */
export function GroundMap({ coordinates, placeName }: GroundMapProps) {
  const t = useTranslations('contact.map')
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="space-y-2">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border-default bg-surface-muted sm:aspect-video">
        {isLoaded ? (
          <iframe
            title={t('title', { place: placeName })}
            src={buildMapEmbedUrl(coordinates)}
            className="size-full"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-4 bg-dots p-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-surface-highlight text-brand-primary">
              <MapIcon aria-hidden="true" className="size-7" />
            </span>
            <Button
              type="button"
              onClick={() => {
                setIsLoaded(true)
              }}
            >
              {t('load')}
            </Button>
            <p className="max-w-sm text-xs text-text-muted">{t('notice')}</p>
          </div>
        )}
      </div>
      {isLoaded && (
        // The embedded map shows the OpenStreetMap attribution itself.
        <p className="flex justify-end text-xs text-text-muted">
          <a
            href={buildLargerMapUrl(coordinates)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-2"
          >
            {t('larger')}
            <ExternalLink aria-hidden="true" className="size-3" />
          </a>
        </p>
      )}
    </div>
  )
}
