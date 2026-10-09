import { useId } from 'react'

import { cn } from '@/shared/lib/cn'

export type FlagCountry = 'gb' | 'de'

export type FlagProps = {
  country: FlagCountry
  className?: string
}

// SVG rather than emoji: Windows renders flag emoji as plain letters ("GB").
function UnionJack() {
  // Unique per instance: several flags can be on the page (switcher button and menu).
  const clipId = useId()

  return (
    <>
      <clipPath id={clipId}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath={`url(#${clipId})`}
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </>
  )
}

function Germany() {
  return (
    <>
      <rect width="60" height="10" fill="#000" />
      <rect y="10" width="60" height="10" fill="#DD0000" />
      <rect y="20" width="60" height="10" fill="#FFCE00" />
    </>
  )
}

const FLAGS: Record<FlagCountry, () => React.JSX.Element> = { gb: UnionJack, de: Germany }

/** A small decorative country flag (3:2), cropped to fill; the language name always sits next to it. */
export function Flag({ country, className }: FlagProps) {
  const Shape = FLAGS[country]

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        'h-4 w-6 shrink-0 overflow-hidden rounded-sm ring-1 ring-border-default',
        className,
      )}
    >
      <Shape />
    </svg>
  )
}
