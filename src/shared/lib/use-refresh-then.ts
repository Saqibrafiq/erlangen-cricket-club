import { useRouter } from '@/i18n/navigation'
import { useEffect, useState, useTransition } from 'react'

/**
 * For editors after a save or delete: fetches the page again (or goes to `href`) and calls back
 * only once the new page is on screen, so a list never lags behind its notice. `isFinishing` stays
 * true meanwhile, keeping the form or dialog busy.
 */
export function useRefreshThen() {
  const router = useRouter()
  const [isRefreshing, startRefresh] = useTransition()
  const [whenRefreshed, setWhenRefreshed] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (whenRefreshed && !isRefreshing) {
      whenRefreshed()
    }
  }, [whenRefreshed, isRefreshing])

  const refreshThen = (callback: () => void, href?: string) => {
    setWhenRefreshed(() => callback)
    startRefresh(() => {
      if (href) {
        router.push(href)
      } else {
        router.refresh()
      }
    })
  }

  return { refreshThen, isFinishing: whenRefreshed !== null }
}
