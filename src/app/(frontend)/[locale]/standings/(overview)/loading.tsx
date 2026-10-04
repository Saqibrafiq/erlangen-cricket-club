import { StandingsSkeleton } from '@/features/standings'
import { Container } from '@/shared/ui/container'

// In the (overview) group so this Suspense boundary does not wrap competition pages
// (see fixtures/(overview)/loading.tsx and arc42 runtime view 6.4).
export default function StandingsLoading() {
  return (
    <Container className="py-10">
      <StandingsSkeleton />
    </Container>
  )
}
