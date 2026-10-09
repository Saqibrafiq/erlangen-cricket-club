import { Container } from '@/shared/ui/container'
import { Skeleton } from '@/shared/ui/skeleton'

// Decorative placeholder only: no text, so no translations are needed here (see arc42 §8.1).
export default function PlayerProfileLoading() {
  return (
    <Container className="space-y-6 py-10" aria-busy="true">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <Skeleton className="h-56 w-full rounded-3xl" />
      </div>
    </Container>
  )
}
