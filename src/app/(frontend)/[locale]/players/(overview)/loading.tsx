import { PlayersSkeleton } from '@/features/players'
import { Container } from '@/shared/ui/container'

// In the (overview) group so this Suspense boundary does not wrap profile pages
// (see fixtures/(overview)/loading.tsx and arc42 runtime view 6.4).
export default function PlayersLoading() {
  return (
    <Container className="py-10">
      <PlayersSkeleton />
    </Container>
  )
}
