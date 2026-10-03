import { FixturesSkeleton } from '@/features/fixtures'
import { Container } from '@/shared/ui/container'

export default function CompetitionLoading() {
  return (
    <Container className="py-10">
      <FixturesSkeleton />
    </Container>
  )
}
