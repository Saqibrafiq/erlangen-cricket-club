import Image from 'next/image'
import type { ReactNode } from 'react'

import logo from '@/shared/assets/ecc-logo.png'

// Intrinsic size of the crest asset (see SiteHeader).
const LOGO_WIDTH = 150
const LOGO_HEIGHT = 192

export type AuthCardProps = {
  title: string
  intro: string
  children: ReactNode
}

/** One card with the crest on the brand background: the frame of the sign-in pages. */
export function AuthCard({ title, intro, children }: AuthCardProps) {
  return (
    <section className="relative isolate flex min-h-hero items-center justify-center overflow-hidden bg-linear-to-br from-brand-surface to-media-overlay px-4 py-12">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-dots-on-media" />
      <div className="w-full max-w-md rounded-2xl bg-surface-default p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src={logo}
            alt=""
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            className="h-16 w-auto"
          />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight uppercase">{title}</h1>
          <p className="mt-1 text-text-muted">{intro}</p>
        </div>
        {children}
      </div>
    </section>
  )
}
