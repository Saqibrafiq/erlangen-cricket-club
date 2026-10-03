import { FixturesSkeleton } from '@/features/fixtures'
import { Container } from '@/shared/ui/container'

// Lives in the (overview) group so its Suspense boundary does not wrap competition pages,
// where it would turn notFound() into a 200 response (see [competition]/layout.tsx).
export default function FixturesLoading() {
  return (
    <Container className="py-10">
      <FixturesSkeleton />
    </Container>
  )
}
