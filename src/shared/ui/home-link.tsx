'use client'

import type { ComponentProps } from 'react'

import { Link } from '@/i18n/navigation'
import { useScrollToTopOnCurrentPage } from '@/shared/lib/scroll-to-top'

const HOME_PATH = '/'

export type HomeLinkProps = Omit<ComponentProps<typeof Link>, 'href'>

/** A link to the home page (the club crest); on the home page itself it scrolls back to the top. */
export function HomeLink({ onClick, ...props }: HomeLinkProps) {
  const scrollIfCurrent = useScrollToTopOnCurrentPage(HOME_PATH)

  return (
    <Link
      href={HOME_PATH}
      onClick={(event) => {
        onClick?.(event)
        scrollIfCurrent()
      }}
      {...props}
    />
  )
}
